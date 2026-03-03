import { useStore } from "@nanostores/preact";

import { getDamageModifier } from "@scripts/combat/body";
import { $allSkills, $meleeSkills } from "@stores/skills";
import { $BT, $REF } from "@stores/stats";
import { $allOwnedWeapons } from "@stores/weapons";

import { ManeuverTable } from "./ManeuverTable";
import { MeleeWeaponCard } from "./MeleeWeaponCard";

const DEFENSE_SKILLS = ["Dodge & Escape", "Athletics"];

export default function MeleePanel() {
  const weapons = useStore($allOwnedWeapons);
  const skills = useStore($allSkills);
  const meleeSkills = useStore($meleeSkills);
  const ref = useStore($REF);
  const bt = useStore($BT);

  const meleeWeapons = weapons.filter((w) => w.melee);
  const dm = getDamageModifier(bt.current);
  const dmSign = dm >= 0 ? `+${dm}` : `${dm}`;

  const brawlingLevel = skills["Brawling"]?.level ?? 0;
  const unarmedTotal = ref.current + brawlingLevel;

  return (
    <div class="combat-list">
      <div class="melee-stats">
        <span>
          REF <strong>{ref.current}</strong>
        </span>
        <span>
          Damage Mod <strong>{dmSign}</strong>
        </span>
        <span class="melee-stats-spacer" />
        {DEFENSE_SKILLS.map((name) => (
          <div key={name} class="label-chip">
            <span class="label-chip-label">{name}</span>
            <span class="label-chip-value">{skills[name]?.level ?? 0}</span>
          </div>
        ))}
      </div>

      {meleeWeapons.map((weapon) => (
        <MeleeWeaponCard
          key={weapon.id}
          weapon={weapon}
          dmSign={dmSign}
          meleeSkills={meleeSkills}
          refCurrent={ref.current}
        />
      ))}

      <div class="combat-card melee-unarmed">
        <div class="cc-header">
          <div class="cc-name">Unarmed</div>
          <div class="cc-hero-cell">{/* spacer */}</div>
          <div class="cc-hero-cell">
            <span class="cc-hero-value">Punch 1D6/2 ({dmSign})</span>
          </div>
          <div class="cc-hero-cell">
            <span class="cc-hero-value">Kick 1D6 ({dmSign})</span>
          </div>
        </div>
        <div class="cc-hero">
          <div class="cc-hero-cell cc-hero-skill">
            <span class="cc-hero-total">+{unarmedTotal}</span>
            <span class="cc-hero-formula">
              REF {ref.current} + Brawling {brawlingLevel}
            </span>
          </div>
        </div>
      </div>

      <ManeuverTable />
    </div>
  );
}
