import { useRef, useState } from "preact/hooks";

import type { ArmorPiece } from "@scripts/armor/core";

import { ItemCard } from "../../shared/ItemCard";

import { getConditionClassFromSP } from "../utils";

import { BodyPartsCoverage } from "./BodyPartsCoverage";
import { RepairPopover } from "./RepairPopover";

interface Props {
  implant: ArmorPiece;
}

export const ImplantCard = ({ implant }: Props) => {
  const [repairOpen, setRepairOpen] = useState(false);
  const repairRef = useRef<HTMLButtonElement>(null);

  const damaged = implant.spCurrent < implant.spMax;

  return (
    <ItemCard
      owned
      equipped
      name={implant.name}
      meta={
        <span class="armor-card-sp">
          <span
            class={getConditionClassFromSP(implant.spCurrent, implant.spMax)}
          >
            {implant.spCurrent}
          </span>
          /{implant.spMax}
        </span>
      }
    >
      <div class="armor-card-details">
        <BodyPartsCoverage
          bodyParts={implant.bodyParts}
          spByPart={implant.spByPart}
          template={implant}
        />
        {implant.ev != null && implant.ev > 0 && (
          <span class="armor-card-ev">EV {implant.ev}</span>
        )}
        {damaged && (
          <span class="armor-card-right">
            <button
              ref={repairRef}
              class="btn-ghost btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                setRepairOpen(true);
              }}
            >
              Repair
            </button>
            <RepairPopover
              anchorRef={repairRef}
              open={repairOpen}
              onClose={() => setRepairOpen(false)}
              armorId={implant.id}
              template={implant}
              bodyParts={implant.bodyParts}
              spByPart={implant.spByPart}
            />
          </span>
        )}
      </div>
    </ItemCard>
  );
};
