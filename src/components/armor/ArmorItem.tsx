import { useState, useRef } from "preact/hooks";
import { toggleArmor, discardArmor } from "@stores/armor";
import type { ArmorPiece } from "@scripts/armor/core";
import { ConfirmPopover } from "@components/shared/ConfirmPopover";
import { BodyPartsCoverage } from "./BodyPartsCoverage";
import { RepairPopover } from "./RepairPopover";
import { getConditionClassFromSP } from "./utils";

interface Props {
  armor: ArmorPiece;
  showActions: boolean;
}

export const ArmorItem = ({ armor, showActions }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [repairOpen, setRepairOpen] = useState(false);
  const discardBtnRef = useRef<HTMLButtonElement>(null);
  const coverageRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    const result = toggleArmor(armor.id);
    if (!result.success) {
      setError(result.error);
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div class={armor.worn ? "armor-item armor-worn" : "armor-item"}>
      <div class="flex-between gap-12 armor-header">
        <h4>
          <span class="armor-type-icon">
            {armor.type === "hard" ? "⬡" : "≈"}
          </span>
          {armor.name}
        </h4>
        <span class="armor-sp">
          <span class={getConditionClassFromSP(armor.spCurrent, armor.spMax)}>
            {armor.spCurrent}
          </span>
          /{armor.spMax}
          {armor.ev ? ` | EV: ${armor.ev}` : ""}
        </span>
      </div>
      <div
        ref={coverageRef}
        class="armor-coverage-row"
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          setRepairOpen(true);
        }}
      >
        <span class="btn-ghost btn-sm">Repair/Break</span>
        <BodyPartsCoverage
          bodyParts={armor.bodyParts}
          spByPart={armor.spByPart}
          spMax={armor.spMax}
        />
      </div>
      <RepairPopover
        anchorRef={coverageRef}
        open={repairOpen}
        onClose={() => setRepairOpen(false)}
        armorId={armor.id}
        maxSP={armor.spMax}
        bodyParts={armor.bodyParts}
        spByPart={armor.spByPart}
      />
      {error && <p class="text-error">{error}</p>}
      {showActions && (
        <div class="flex-between gap-8 armor-actions">
          <button
            class={armor.worn ? "btn-primary active" : "btn-primary"}
            onClick={handleToggle}
          >
            {armor.worn ? "Remove" : "Wear"}
          </button>
          <button
            ref={discardBtnRef}
            class="btn-ghost-danger"
            onClick={() => setConfirmOpen(true)}
          >
            Discard
          </button>
          <ConfirmPopover
            anchorRef={discardBtnRef}
            open={confirmOpen}
            message={`Discard ${armor.name}?`}
            confirmText="Discard"
            cancelText="Keep"
            type="danger"
            onConfirm={() => {
              discardArmor(armor.id);
              setConfirmOpen(false);
            }}
            onCancel={() => setConfirmOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
