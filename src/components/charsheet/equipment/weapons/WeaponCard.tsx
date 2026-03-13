import { ItemCard } from "@components/charsheet/shared/ItemCard";
import { ItemMeta } from "@components/charsheet/shared/ItemMeta";
import type { WeaponTemplate } from "@scripts/weapons/catalog";
import {
  CONCEALABILITY_LABELS,
  WEAPON_TYPE_LABELS,
} from "@scripts/weapons/catalog";
import type { WeaponPiece } from "@stores/weapons";

function isInstance(
  weapon: WeaponTemplate | WeaponPiece,
): weapon is WeaponPiece {
  return "id" in weapon && "currentAmmo" in weapon;
}

interface Props {
  weapon: WeaponTemplate | WeaponPiece;
  selected?: boolean;
  highlighted?: boolean;
  owned?: boolean;
  custom?: boolean;
  onClick?: () => void;
}

export const WeaponCard = ({
  weapon,
  selected,
  highlighted,
  owned,
  custom,
  onClick,
}: Props) => {
  const instance = isInstance(weapon);

  return (
    <ItemCard
      class="weapon-card"
      selected={selected}
      highlighted={highlighted}
      owned={owned}
      custom={custom}
      onClick={onClick}
      name={
        <>
          <span class="weapon-card-type">
            {WEAPON_TYPE_LABELS[weapon.type]}
          </span>
          {weapon.name}
        </>
      }
      meta={<ItemMeta availability={weapon.availability} cost={weapon.cost} />}
    >
      <div class="weapon-card-details">
        <span class="weapon-card-stat">{weapon.damage}</span>
        {!weapon.melee && <span class="weapon-card-stat">{weapon.range}m</span>}
        <span class="weapon-card-stat">
          WA {weapon.wa >= 0 ? "+" : ""}
          {weapon.wa}
        </span>
        <span class="weapon-card-stat">
          {CONCEALABILITY_LABELS[weapon.concealability]}
        </span>
        {instance && !weapon.melee && weapon.shots > 0 && (
          <span class="weapon-card-ammo">
            {weapon.currentAmmo}/{weapon.shots}
          </span>
        )}
      </div>
    </ItemCard>
  );
};
