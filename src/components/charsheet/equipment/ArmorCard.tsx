import type { ArmorPiece, ArmorTemplate } from "@scripts/armor/core";

import { ItemCard } from "../shared/ItemCard";
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

  return (
    <ItemCard
      class="armor-card"
      selected={selected}
      highlighted={highlighted}
      accent={(owned && armor.worn) || custom}
      onClick={onClick}
      name={
        <>
          <span class="armor-type-icon">
            {armor.type === "hard" ? "\u2B21" : "\u2248"}
          </span>
          {armor.name}
        </>
      }
      meta={
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
      }
    >
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
    </ItemCard>
  );
};
