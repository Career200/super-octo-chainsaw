import { useStore } from "@nanostores/preact";

import { $allSkills } from "@stores/skills";
import { $REF } from "@stores/stats";
import { $allOwnedWeapons } from "@stores/weapons";

import { WeaponCombatCard } from "./WeaponCombatCard";

export default function RangedPanel() {
  const weapons = useStore($allOwnedWeapons);
  const skills = useStore($allSkills);
  const ref = useStore($REF);

  const rangedWeapons = weapons.filter((w) => !w.melee);

  if (rangedWeapons.length === 0) {
    return (
      <p class="combat-empty">
        No ranged weapons. Add some in the Equipment tab.
      </p>
    );
  }

  return (
    <div class="combat-list">
      {rangedWeapons.map((weapon) => {
        const skillEntry = skills[weapon.skill];
        return (
          <WeaponCombatCard
            key={weapon.id}
            weapon={weapon}
            refCurrent={ref.current}
            skillLevel={skillEntry?.level ?? 0}
            skillName={weapon.skill}
          />
        );
      })}
    </div>
  );
}
