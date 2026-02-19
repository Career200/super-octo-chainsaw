import { useState, useRef } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $selectedArmor, $addingArmor, selectArmor } from "@stores/ui";
import {
  $ownedArmor,
  $customArmorTemplates,
  getArmorPiece,
  resolveTemplate,
  isCustomArmor,
  acquireArmor,
  addCustomArmor,
  updateCustomArmor,
  removeCustomArmor,
  toggleArmor,
  discardArmor,
} from "@stores/armor";
import {
  PART_ABBREV,
  getPartSpMax,
  type BodyPartName,
} from "@scripts/armor/core";
import type { Availability } from "@scripts/catalog-common";
import { BottomBarItemShell } from "../common/bottombar/BottomBarItemShell";
import { ItemForm } from "../shared/ItemForm";
import { ArmorFormFields } from "./ArmorFormFields";
import { ConfirmPopover } from "../shared/ConfirmPopover";
import { RepairPopover } from "./RepairPopover";
import { getConditionClassFromSP } from "./utils";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export const BottomBarArmor = ({ expanded, onToggle }: Props) => {
  const armorId = useStore($selectedArmor);
  const adding = useStore($addingArmor);
  useStore($ownedArmor);
  const customDefs = useStore($customArmorTemplates);

  // Resolve what we're showing
  const ownedPiece = armorId ? getArmorPiece(armorId) : null;
  const template = !ownedPiece && armorId ? resolveTemplate(armorId) : null;
  const isCustom = armorId ? isCustomArmor(armorId) : false;
  const hasCustomDef = armorId ? armorId in customDefs : false;

  // Add-mode form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newAvailability, setNewAvailability] = useState<Availability | "">("");
  const [newBodyParts, setNewBodyParts] = useState<BodyPartName[]>([]);
  const [newType, setNewType] = useState<"soft" | "hard">("soft");
  const [newSp, setNewSp] = useState(0);
  const [newEv, setNewEv] = useState(0);

  const [editNotice, setEditNotice] = useState<string | null>(null);

  // Owned instance action state
  const [wearError, setWearError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [repairOpen, setRepairOpen] = useState(false);
  const discardBtnRef = useRef<HTMLButtonElement>(null);
  const repairBtnRef = useRef<HTMLButtonElement>(null);

  const notifyIfRemoved = (removed: number) => {
    if (removed > 0) {
      setEditNotice(
        `${removed} owned ${removed === 1 ? "instance" : "instances"} removed`,
      );
      setTimeout(() => setEditNotice(null), 3000);
    }
  };

  const handleAdd = (): string | null => {
    const trimmed = newName.trim();
    if (!trimmed) return "Name cannot be empty";
    if (newBodyParts.length === 0) return "Select at least one body part";
    const cost = newCost ? Number(newCost) : 0;
    const instanceId = addCustomArmor(trimmed, {
      type: newType,
      spMax: newSp,
      bodyParts: newBodyParts,
      ev: newEv,
      cost: !isNaN(cost) ? cost : 0,
      description: newDescription.trim(),
      availability: newAvailability || "C",
    });
    if (instanceId) {
      setNewName("");
      setNewDescription("");
      setNewCost("");
      setNewAvailability("");
      setNewBodyParts([]);
      setNewType("soft");
      setNewSp(0);
      setNewEv(0);
      selectArmor(instanceId);
      return null;
    }
    return `"${trimmed}" already exists`;
  };

  const handleRemove = () => {
    removeCustomArmor(armorId!);
    selectArmor(null);
  };

  // Determine header label
  const headerLabel = adding
    ? "New custom armor"
    : ownedPiece
      ? ownedPiece.name
      : template
        ? template.name
        : "";

  const hasContent = adding || !!(ownedPiece || template);

  // --- Header actions by mode ---
  let headerActions = null;

  if (template && !adding) {
    // Template selected (catalog or custom) — show Take button
    const handleAcquire = (e: MouseEvent) => {
      e.stopPropagation();
      const instance = acquireArmor(template.templateId);
      if (instance) selectArmor(instance.id);
    };
    headerActions = (
      <button class="bar-action" onClick={handleAcquire}>
        Take
      </button>
    );
  } else if (ownedPiece) {
    // Owned instance — show Wear/Remove + Repair + Discard
    const handleWear = (e: MouseEvent) => {
      e.stopPropagation();
      const result = toggleArmor(ownedPiece.id);
      if (!result.success) {
        setWearError(result.error);
        setTimeout(() => setWearError(null), 3000);
      }
    };
    headerActions = (
      <>
        <button
          class={ownedPiece.worn ? "bar-action active" : "bar-action"}
          onClick={handleWear}
        >
          {ownedPiece.worn ? "Remove" : "Wear"}
        </button>
        <button
          ref={repairBtnRef}
          class="bar-action"
          onClick={(e) => {
            e.stopPropagation();
            setRepairOpen(true);
          }}
        >
          Repair
        </button>
        <RepairPopover
          anchorRef={repairBtnRef}
          open={repairOpen}
          onClose={() => setRepairOpen(false)}
          armorId={ownedPiece.id}
          template={ownedPiece}
          bodyParts={ownedPiece.bodyParts}
          spByPart={ownedPiece.spByPart}
        />
        <button
          ref={discardBtnRef}
          class="bar-action bar-remove"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmOpen(true);
          }}
        >
          Discard
        </button>
        <ConfirmPopover
          anchorRef={discardBtnRef}
          open={confirmOpen}
          message={`Discard ${ownedPiece.name}?`}
          confirmText="Discard"
          cancelText="Keep"
          type="danger"
          onConfirm={() => {
            discardArmor(ownedPiece.id);
            selectArmor(null);
            setConfirmOpen(false);
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      </>
    );
  }

  // --- Body content ---
  let bodyContent = null;

  if (adding) {
    bodyContent = (
      <ItemForm
        disabled={false}
        name={newName}
        onNameChange={setNewName}
        description={newDescription}
        onDescriptionChange={setNewDescription}
        cost={newCost}
        onCostChange={setNewCost}
        availability={newAvailability}
        onAvailabilityChange={setNewAvailability}
      >
        <ArmorFormFields
          bodyParts={newBodyParts}
          onBodyPartsChange={setNewBodyParts}
          type={newType}
          onTypeChange={setNewType}
          spMax={newSp}
          onSpMaxChange={setNewSp}
          ev={newEv}
          onEvChange={setNewEv}
        />
      </ItemForm>
    );
  } else if (isCustom && hasCustomDef && template) {
    bodyContent = (
      <ItemForm
        disabled
        name={template.name}
        description={template.description}
        onDescriptionChange={(v) =>
          notifyIfRemoved(updateCustomArmor(armorId!, { description: v }))
        }
        cost={template.cost != null ? String(template.cost) : ""}
        onCostChange={(v) => {
          const n = v ? Number(v) : undefined;
          notifyIfRemoved(
            updateCustomArmor(armorId!, {
              cost: n != null && !isNaN(n) ? n : 0,
            }),
          );
        }}
        availability={template.availability ?? ""}
        onAvailabilityChange={(v) =>
          notifyIfRemoved(
            updateCustomArmor(armorId!, {
              availability: (v as Availability) || undefined,
            }),
          )
        }
      >
        {editNotice && (
          <p class="text-error text-sm" style="flex: 1 1 100%">
            {editNotice}
          </p>
        )}
        <ArmorFormFields
          bodyParts={template.bodyParts}
          onBodyPartsChange={(parts) =>
            notifyIfRemoved(updateCustomArmor(armorId!, { bodyParts: parts }))
          }
          type={template.type}
          onTypeChange={(t) =>
            notifyIfRemoved(updateCustomArmor(armorId!, { type: t }))
          }
          spMax={template.spMax}
          onSpMaxChange={(sp) =>
            notifyIfRemoved(updateCustomArmor(armorId!, { spMax: sp }))
          }
          ev={template.ev ?? 0}
          onEvChange={(v) =>
            notifyIfRemoved(updateCustomArmor(armorId!, { ev: v }))
          }
        />
      </ItemForm>
    );
  } else if (template) {
    bodyContent = (
      <>
        <div class="armor-detail-grid">
          {template.bodyParts.map((part) => (
            <div key={part} class="armor-detail-part">
              <span class="coverage-badge">{PART_ABBREV[part]}</span>
              <span>{template.spMax}</span>
            </div>
          ))}
        </div>
        <p class="text-desc">{template.description}</p>
      </>
    );
  } else if (ownedPiece) {
    // Owned instance — per-part SP
    bodyContent = (
      <>
        {wearError && <p class="text-error text-sm">{wearError}</p>}
        <div class="armor-detail-grid">
          {ownedPiece.bodyParts.map((part) => {
            const sp = ownedPiece.spByPart[part] ?? 0;
            const max = getPartSpMax(ownedPiece, part);
            return (
              <div key={part} class="armor-detail-part">
                <span class="coverage-badge">{PART_ABBREV[part]}</span>
                <span class={getConditionClassFromSP(sp, max)}>
                  {sp}/{max}
                </span>
              </div>
            );
          })}
        </div>
        <p class="text-desc">{ownedPiece.description}</p>
      </>
    );
  }

  return (
    <BottomBarItemShell
      expanded={expanded}
      onToggle={onToggle}
      headerLabel={headerLabel}
      hasContent={hasContent}
      hintText="Select an item"
      adding={adding}
      onAdd={handleAdd}
      isCustom={isCustom && !ownedPiece}
      removeName={template?.name}
      onRemove={handleRemove}
      headerActions={headerActions}
    >
      {bodyContent}
    </BottomBarItemShell>
  );
};
