import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";

import { AcquireDiscardActions } from "@components/charsheet/common/bottombar/AcquireDiscardActions";
import { BottomBarItemShell } from "@components/charsheet/common/bottombar/BottomBarItemShell";
import { parseNum, useFormState } from "@components/charsheet/shared";
import { ItemForm } from "@components/charsheet/shared/ItemForm";
import { usePopoverState } from "@components/charsheet/shared/usePopoverState";
import {
  type BodyPartName,
  getPartSpMax,
  PART_ABBREV,
} from "@scripts/armor/core";
import type { Availability } from "@scripts/catalog-common";
import {
  $customArmorTemplates,
  $ownedArmor,
  acquireArmor,
  addCustomArmor,
  discardArmor,
  getArmorPiece,
  isCustomArmor,
  removeCustomArmor,
  renameCustomArmor,
  resolveTemplate,
  toggleArmor,
  updateCustomArmor,
} from "@stores/armor";
import { $addingArmor, $selectedArmor, selectArmor } from "@stores/ui";

import { getConditionClassFromSP } from "../utils";

import { ArmorFormFields } from "./ArmorFormFields";
import { RepairPopover } from "./RepairPopover";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export default function BottomBarArmor({ expanded, onToggle }: Props) {
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
  const { fields: f, setField, reset } = useFormState({
    name: "",
    description: "",
    cost: "",
    availability: "" as Availability | "",
    bodyParts: [] as BodyPartName[],
    type: "soft" as "soft" | "hard",
    sp: 0,
    ev: 0,
  });

  const [editNotice, setEditNotice] = useState<string | null>(null);
  const [addAttempted, setAddAttempted] = useState(false);

  // Owned instance action state
  const [wearError, setWearError] = useState<string | null>(null);
  const {
    ref: repairBtnRef,
    open: repairOpen,
    setOpen: setRepairOpen,
  } = usePopoverState();

  const notifyIfRemoved = (removed: number) => {
    if (removed > 0) {
      setEditNotice(
        `${removed} owned ${removed === 1 ? "instance" : "instances"} removed`,
      );
      setTimeout(() => setEditNotice(null), 3000);
    }
  };

  const handleAdd = (): string | null => {
    const trimmed = f.name.trim();
    if (!trimmed || f.bodyParts.length === 0) {
      setAddAttempted(true);
      if (!trimmed) return "Name cannot be empty";
      return "Select at least one body part";
    }
    const instanceId = addCustomArmor(trimmed, {
      type: f.type,
      spMax: f.sp,
      bodyParts: f.bodyParts,
      ev: f.ev,
      cost: parseNum(f.cost, 0),
      description: f.description.trim(),
      availability: f.availability || "C",
    });
    if (instanceId) {
      setAddAttempted(false);
      reset();
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
  const headerActions =
    template || ownedPiece ? (
      <AcquireDiscardActions
        showAcquire={!!template && !adding}
        onAcquire={(e) => {
          e.stopPropagation();
          const instance = acquireArmor(template!.templateId);
          if (instance) selectArmor(instance.id);
        }}
        showDiscard={!!ownedPiece}
        discardName={ownedPiece?.name}
        onDiscard={() => {
          discardArmor(ownedPiece!.id);
          selectArmor(null);
        }}
      >
        {ownedPiece && (
          <>
            <button
              class={ownedPiece.worn ? "bar-action active" : "bar-action"}
              onClick={(e) => {
                e.stopPropagation();
                const result = toggleArmor(ownedPiece.id);
                if (!result.success) {
                  setWearError(result.error);
                  setTimeout(() => setWearError(null), 3000);
                }
              }}
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
          </>
        )}
      </AcquireDiscardActions>
    ) : null;

  // --- Body content ---
  let bodyContent = null;

  if (adding) {
    const addErrors = new Set<string>();
    if (addAttempted) {
      if (!f.name.trim()) addErrors.add("name");
      if (f.bodyParts.length === 0) addErrors.add("bodyParts");
    }
    bodyContent = (
      <ItemForm
        disabled={false}
        name={f.name}
        onNameChange={(v) => setField("name", v)}
        description={f.description}
        onDescriptionChange={(v) => setField("description", v)}
        cost={f.cost}
        onCostChange={(v) => setField("cost", v)}
        availability={f.availability}
        onAvailabilityChange={(v) => setField("availability", v)}
        errors={addErrors}
      >
        <ArmorFormFields
          bodyParts={f.bodyParts}
          onBodyPartsChange={(v) => setField("bodyParts", v)}
          type={f.type}
          onTypeChange={(v) => setField("type", v)}
          spMax={f.sp}
          onSpMaxChange={(v) => setField("sp", v)}
          ev={f.ev}
          onEvChange={(v) => setField("ev", v)}
          errors={addErrors}
        />
      </ItemForm>
    );
  } else if (isCustom && hasCustomDef && template) {
    bodyContent = (
      <ItemForm
        disabled
        name={template.name}
        onNameChange={(v) => {
          if (renameCustomArmor(armorId!, v)) selectArmor(v);
        }}
        description={template.description}
        onDescriptionChange={(v) =>
          notifyIfRemoved(updateCustomArmor(armorId!, { description: v }))
        }
        cost={template.cost != null ? String(template.cost) : ""}
        onCostChange={(v) =>
          notifyIfRemoved(
            updateCustomArmor(armorId!, { cost: parseNum(v, 0) }),
          )
        }
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
              <span class="badge">{PART_ABBREV[part]}</span>
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
                <span class="badge">{PART_ABBREV[part]}</span>
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
}
