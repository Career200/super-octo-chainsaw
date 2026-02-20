import type { ArmorPiece, ArmorTemplate } from "@scripts/armor/core";

import { ItemMeta } from "../shared/ItemMeta";

import { BodyPartsCoverage } from "./BodyPartsCoverage";
import { getConditionClassFromSP } from "./utils";

interface Props {
  armor: ArmorPiece | ArmorTemplate;
  selected?: boolean;
  highlighted?: boolean;
  custom?: boolean;
  onClick?: () => void;
}

function isInstance(armor: ArmorPiece | ArmorTemplate): armor is ArmorPiece {
  return "id" in armor && "worn" in armor;
}

export const ArmorCard = ({
  armor,
  selected,
  highlighted,
  custom,
  onClick,
}: Props) => {
  const owned = isInstance(armor);

  const cls = [
    "item-card armor-card",
    ((owned && armor.worn) || custom) && "item-card-accent",
    selected && "selected",
    highlighted && "highlighted",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div class={cls} onClick={onClick}>
      <div class="flex-between gap-8">
        <h4>
          <span class="armor-type-icon">
            {armor.type === "hard" ? "\u2B21" : "\u2248"}
          </span>
          {armor.name}
        </h4>
        <span class="armor-card-sp">
          {owned ? (
            <>
              <span
                class={getConditionClassFromSP(armor.spCurrent, armor.spMax)}
              >
                {armor.spCurrent}
              </span>
              /{armor.spMax}
            </>
          ) : (
            <>{armor.spMax}</>
          )}
        </span>
      </div>
      <div class="armor-card-details">
        <BodyPartsCoverage
          bodyParts={armor.bodyParts}
          spByPart={owned ? armor.spByPart : undefined}
          template={armor}
        />
        {armor.ev != null && armor.ev > 0 && (
          <span class="armor-card-ev">EV {armor.ev}</span>
        )}
        <span class="armor-card-right">
          <ItemMeta
            availability={armor.availability}
            cost={!owned ? armor.cost : undefined}
          />
        </span>
      </div>
    </div>
  );
};
