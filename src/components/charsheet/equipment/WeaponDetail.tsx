import { useStore } from "@nanostores/preact";

import type { WeaponTemplate } from "@scripts/weapons/catalog";
import { RELIABILITY_LABELS, WEAPON_TYPE_LABELS } from "@scripts/weapons/catalog";
import { $allSkills } from "@stores/skills";

interface Props {
  weapon: WeaponTemplate;
}

/** Read-only weapon stat display for catalog/owned items. */
export function WeaponDetail({ weapon }: Props) {
  const allSkills = useStore($allSkills);

  return (
    <div class="weapon-detail">
      <div class="weapon-detail-stats">
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">Type</span>
          {WEAPON_TYPE_LABELS[weapon.type]}
        </span>
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">Skill</span>
          {weapon.skill}
          {!Object.keys(allSkills).some(
            (k) => k.toLowerCase() === weapon.skill.toLowerCase(),
          ) && (
            <span class="text-danger" style="font-size: var(--font-ui-sm)">
              Not found
            </span>
          )}
        </span>
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">Damage</span>
          {weapon.damage}
        </span>
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">WA</span>
          {weapon.wa >= 0 ? "+" : ""}
          {weapon.wa}
        </span>
        {!weapon.melee && (
          <>
            <span class="weapon-detail-stat">
              <span class="weapon-detail-label">Range</span>
              {weapon.range}m
            </span>
            <span class="weapon-detail-stat">
              <span class="weapon-detail-label">Ammo</span>
              {weapon.ammo}
            </span>
            <span class="weapon-detail-stat">
              <span class="weapon-detail-label">Shots</span>
              {weapon.shots}
            </span>
          </>
        )}
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">RoF</span>
          {weapon.rof}
        </span>
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">Rel.</span>
          {RELIABILITY_LABELS[weapon.reliability]}
        </span>
      </div>
      <p class="text-desc">{weapon.description}</p>
    </div>
  );
}
