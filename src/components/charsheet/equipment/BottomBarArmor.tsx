import { useState, useRef } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $selectedArmor, selectArmor } from "@stores/ui";
import {
  $ownedArmor,
  getArmorPiece,
  getTemplate,
  acquireArmor,
  toggleArmor,
  discardArmor,
} from "@stores/armor";
import { PART_ABBREV, getPartSpMax } from "@scripts/armor/core";
import { Chevron } from "../shared/Chevron";
import { ConfirmPopover } from "../shared/ConfirmPopover";
import { RepairPopover } from "./RepairPopover";
import { getConditionClassFromSP } from "./utils";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export const BottomBarArmor = ({ expanded, onToggle }: Props) => {
  const armorId = useStore($selectedArmor);
  useStore($ownedArmor); // re-render on armor state changes

  const armor = armorId ? getArmorPiece(armorId) : null;
  const template = !armor && armorId ? getTemplate(armorId) : null;

  const [wearError, setWearError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [repairOpen, setRepairOpen] = useState(false);
  const discardBtnRef = useRef<HTMLButtonElement>(null);
  const repairBtnRef = useRef<HTMLButtonElement>(null);

  if (!armor && !template) {
    return (
      <div class="bottom-bar-row">
        <span class="bottom-bar-hint">Select an item</span>
      </div>
    );
  }

  // Template selected (from catalog)
  if (template) {
    const handleAcquire = (e: MouseEvent) => {
      e.stopPropagation();
      const instance = acquireArmor(template.templateId);
      if (instance) selectArmor(instance.id);
    };

    return (
      <>
        <div class="bottom-bar-row expandable" onClick={onToggle}>
          <div class="bottom-bar-content">
            <span class="bottom-bar-name">{template.name}</span>
            <span class="text-soft text-sm">Catalog</span>
          </div>
          <div class="bottom-bar-actions">
            <button class="bar-action" onClick={handleAcquire}>
              Take ({template.cost}eb)
            </button>
            <Chevron expanded={expanded} />
          </div>
        </div>
        {expanded && (
          <div class="bottom-bar-body">
            <div class="armor-detail-grid">
              {template.bodyParts.map((part) => (
                <div key={part} class="armor-detail-part">
                  <span class="coverage-badge">{PART_ABBREV[part]}</span>
                  <span>{template.spMax}</span>
                </div>
              ))}
            </div>
            <p class="text-desc">{template.description}</p>
          </div>
        )}
      </>
    );
  }

  // Owned armor selected
  const handleWear = (e: MouseEvent) => {
    e.stopPropagation();
    const result = toggleArmor(armor!.id);
    if (!result.success) {
      setWearError(result.error);
      setTimeout(() => setWearError(null), 3000);
    }
  };

  const handleDiscard = () => {
    discardArmor(armor!.id);
    selectArmor(null);
    setConfirmOpen(false);
  };

  return (
    <>
      <div class="bottom-bar-row expandable" onClick={onToggle}>
        <div class="bottom-bar-content">
          <span class="bottom-bar-name">{armor!.name}</span>
          {wearError && <span class="text-error text-sm">{wearError}</span>}
        </div>
        <div class="bottom-bar-actions">
          <button
            class={armor!.worn ? "bar-action active" : "bar-action"}
            onClick={handleWear}
          >
            {armor!.worn ? "Remove" : "Wear"}
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
            armorId={armor!.id}
            template={armor!}
            bodyParts={armor!.bodyParts}
            spByPart={armor!.spByPart}
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
            message={`Discard ${armor!.name}?`}
            confirmText="Discard"
            cancelText="Keep"
            type="danger"
            onConfirm={handleDiscard}
            onCancel={() => setConfirmOpen(false)}
          />
          <Chevron expanded={expanded} />
        </div>
      </div>
      {expanded && (
        <div class="bottom-bar-body">
          <div class="armor-detail-grid">
            {armor!.bodyParts.map((part) => {
              const sp = armor!.spByPart[part] ?? 0;
              const max = getPartSpMax(armor!, part);
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
          <p class="text-desc">{armor!.description}</p>
        </div>
      )}
    </>
  );
};
