import type { RefObject } from "preact";
import { useState } from "preact/hooks";

import {
  type ArmorTemplate,
  type BodyPartName,
  getPartSpMax,
  PART_ABBREV,
} from "@scripts/armor/core";
import { getArmorPiece, setArmorSP } from "@stores/armor";
import { recordManipulation } from "@stores/damage-history";

import { Popover } from "../shared/Popover";

import { getConditionClassFromSP } from "./utils";

// Face at its half-max reads as "full"
function getLowestRatioSP(
  template: ArmorTemplate,
  bodyParts: BodyPartName[],
  spByPart: Partial<Record<BodyPartName, number>>,
): number {
  let worstRatio = 1;
  for (const p of bodyParts) {
    const max = getPartSpMax(template, p);
    const sp = spByPart[p] ?? max;
    if (max > 0) worstRatio = Math.min(worstRatio, sp / max);
  }
  return Math.round(worstRatio * template.spMax);
}

interface Props {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  armorId: string;
  template: ArmorTemplate;
  bodyParts: BodyPartName[];
  spByPart: Partial<Record<BodyPartName, number>>;
}

export const RepairPopover = ({
  anchorRef,
  open,
  onClose,
  armorId,
  template,
  bodyParts,
  spByPart,
}: Props) => {
  const [selected, setSelected] = useState<BodyPartName | "all">("all");
  const [sp, setSP] = useState(() =>
    getLowestRatioSP(template, bodyParts, spByPart),
  );

  const maxSP =
    selected === "all" ? template.spMax : getPartSpMax(template, selected);

  const selectPart = (part: BodyPartName | "all") => {
    setSelected(part);
    setSP(
      part === "all"
        ? getLowestRatioSP(template, bodyParts, spByPart)
        : (spByPart[part] ?? getPartSpMax(template, part)),
    );
  };

  const handleApply = () => {
    const armor = getArmorPiece(armorId);
    const partsArray = selected === "all" ? bodyParts : [selected];
    const oldSP = spByPart[partsArray[0]] ?? maxSP;

    if (oldSP !== sp && armor) {
      recordManipulation({
        armorId,
        armorName: armor.shortName ?? armor.name,
        bodyParts: partsArray,
        oldSP,
        newSP: sp,
      });
    }

    setArmorSP(armorId, sp, partsArray);
    onClose();
  };

  const conditionClass = getConditionClassFromSP(sp, maxSP);

  return (
    <Popover
      anchorRef={anchorRef}
      open={open}
      onClose={onClose}
      className={`popover-repair popover-repair-${conditionClass}`}
    >
      <div class="flex-center gap-4 repair-part-selector">
        {bodyParts.map((part) => (
          <button
            key={part}
            type="button"
            class={`coverage-badge repair-selectable${selected === part ? " selected" : ""}`}
            title={part.replace("_", " ")}
            onClick={() => selectPart(part)}
          >
            {PART_ABBREV[part]}
          </button>
        ))}
        <button
          type="button"
          class={`coverage-badge repair-selectable${selected === "all" ? " selected" : ""}`}
          onClick={() => selectPart("all")}
        >
          All
        </button>
      </div>
      <div class="flex-center gap-12 repair-sp-row">
        <button
          type="button"
          class="btn-ghost btn-icon"
          onClick={() => setSP(0)}
        >
          0
        </button>
        <button
          type="button"
          class="btn-ghost btn-icon"
          disabled={sp <= 0}
          onClick={() => setSP(sp - 1)}
        >
          −
        </button>
        <span class={`text-value-2xl repair-sp-value ${conditionClass}`}>
          {sp}
        </span>
        <button
          type="button"
          class="btn-ghost btn-icon"
          disabled={sp >= maxSP}
          onClick={() => setSP(sp + 1)}
        >
          +
        </button>
        <button
          type="button"
          class="btn-ghost btn-icon"
          onClick={() => setSP(maxSP)}
        >
          {maxSP}
        </button>
      </div>
      <div class="popover-actions">
        <button class="popover-btn popover-btn-cancel" onClick={onClose}>
          Dismiss
        </button>
        <button class="popover-btn popover-btn-confirm" onClick={handleApply}>
          Apply
        </button>
      </div>
    </Popover>
  );
};
