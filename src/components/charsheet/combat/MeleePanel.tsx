import { useStore } from "@nanostores/preact";

import { getBodyTypeName, getDamageModifier } from "@scripts/combat/body";
import { $allSkills } from "@stores/skills";
import { $BT, $REF } from "@stores/stats";
import { $allOwnedWeapons } from "@stores/weapons";

import { ManeuverTable } from "./ManeuverTable";
import { MeleeWeaponCard } from "./MeleeWeaponCard";

const ATTACK_SKILLS = ["Brawling", "Melee", "Fencing"];
const DEFENSE_SKILLS = ["Dodge & Escape", "Athletics"];

export default function MeleePanel() {
  const weapons = useStore($allOwnedWeapons);
  const skills = useStore($allSkills);
  const ref = useStore($REF);
  const bt = useStore($BT);

  const meleeWeapons = weapons.filter((w) => w.melee);
  const dm = getDamageModifier(bt.current);
  const btName = getBodyTypeName(bt.current);
  const dmSign = dm >= 0 ? `+${dm}` : `${dm}`;

  return (
    <div class="combat-list">
      <div class="melee-formula">
        <div>Attacker: REF + Skill + WA + 1d10</div>
        <div class="melee-formula-vs">vs.</div>
        <div>Defender: REF + Skill + 1d10</div>
      </div>

      <div class="melee-stats">
        <span>
          REF <strong>{ref.current}</strong>
        </span>
        <span>
          Damage Mod <strong>{dmSign}</strong>{" "}
          <span class="melee-stats-bt">
            ({btName}, BT {bt.current})
          </span>
        </span>
      </div>

      <div class="melee-skills">
        {ATTACK_SKILLS.map((name) => (
          <span key={name} class="melee-skill-chip">
            {name} <strong>{skills[name]?.level ?? 0}</strong>
          </span>
        ))}
        <span class="melee-skill-sep" />
        {DEFENSE_SKILLS.map((name) => (
          <span key={name} class="melee-skill-chip melee-skill-defense">
            {name} <strong>{skills[name]?.level ?? 0}</strong>
          </span>
        ))}
      </div>

      {meleeWeapons.map((weapon) => (
        <MeleeWeaponCard key={weapon.id} weapon={weapon} dmSign={dmSign} />
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
      </div>

      <ManeuverTable />
    </div>
  );
}
