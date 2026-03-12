import type { ArmorPiece, ArmorTemplate } from "@scripts/armor/core";

import { ItemCard } from "../../shared/ItemCard";
import { ItemMeta } from "../../shared/ItemMeta";

import { BodyPartsCoverage } from "./BodyPartsCoverage";
import { getConditionClassFromSP } from "../utils";

interface Props {
  armor: ArmorPiece | ArmorTemplate;
  selected?: boolean;
  highlighted?: boolean;
  owned?: boolean;
  equipped?: boolean;
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
  owned,
  equipped,
  custom,
  onClick,
}: Props) => {
  const instance = isInstance(armor);

  return (
    <ItemCard
      class="armor-card"
      selected={selected}
      highlighted={highlighted}
      owned={owned}
      equipped={equipped}
      custom={custom}
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
          {instance ? (
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
          spByPart={instance ? armor.spByPart : undefined}
          template={armor}
        />
        {armor.ev != null && armor.ev > 0 && (
          <span class="armor-card-ev">EV {armor.ev}</span>
        )}
        <span class="armor-card-right">
          <ItemMeta
            availability={armor.availability}
            cost={!instance ? armor.cost : undefined}
          />
        </span>
      </div>
    </ItemCard>
  );
};
