import { useEffect, useRef } from "preact/hooks";

import type { WeaponTemplate } from "@scripts/weapons/catalog";
import {
  CONCEALABILITY_LABELS,
  WEAPON_TYPE_LABELS,
} from "@scripts/weapons/catalog";
import type { WeaponPiece } from "@stores/weapons";

import { ItemMeta } from "../shared/ItemMeta";

function isInstance(
  weapon: WeaponTemplate | WeaponPiece,
): weapon is WeaponPiece {
  return "id" in weapon && "currentAmmo" in weapon;
}

interface Props {
  weapon: WeaponTemplate | WeaponPiece;
  selected?: boolean;
  highlighted?: boolean;
  custom?: boolean;
  onClick?: () => void;
}

export const WeaponCard = ({
  weapon,
  selected,
  highlighted,
  custom,
  onClick,
}: Props) => {
  const instance = isInstance(weapon);
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (highlighted) {
      cardRef.current?.scrollIntoView({ block: "center" });
    }
  }, [highlighted]);

  const cls = [
    "item-card weapon-card",
    selected && "selected",
    highlighted && "highlighted",
    custom && "item-card-accent",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={cardRef} class={cls} onClick={onClick}>
      <div class="flex-between gap-8">
        <h4>
          <span class="weapon-card-type">
            {WEAPON_TYPE_LABELS[weapon.type]}
          </span>
          {weapon.name}
        </h4>
        <ItemMeta availability={weapon.availability} cost={weapon.cost} />
      </div>
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
    </div>
  );
};
