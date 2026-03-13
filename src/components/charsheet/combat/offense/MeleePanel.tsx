import { useStore } from "@nanostores/preact";

import { getDamageModifier } from "@scripts/combat/body";
import {
  $allSkills,
  $meleeSkills,
  $myMartialArts,
  $resolvedUnarmedSkill,
  setUnarmedSkill,
} from "@stores/skills";
import { $BT, $REF } from "@stores/stats";
import { $allOwnedWeapons } from "@stores/weapons";

import { ManeuverTable } from "./ManeuverTable";
import { MeleeWeaponCard } from "./MeleeWeaponCard";

const DEFENSE_SKILLS = ["Dodge & Escape", "Athletics"];

export default function MeleePanel() {
  const weapons = useStore($allOwnedWeapons);
  const skills = useStore($allSkills);
  const meleeSkills = useStore($meleeSkills);
  const myMartialArts = useStore($myMartialArts);
  const {
    name: selectedName,
    entry: selectedEntry,
    isMa: isMaSelected,
  } = useStore($resolvedUnarmedSkill);
  const ref = useStore($REF);
  const bt = useStore($BT);

  const meleeWeapons = weapons.filter((w) => w.melee);
  const dm = getDamageModifier(bt.current);
  const dmSign = dm >= 0 ? `+${dm}` : `${dm}`;

  const brawlingEntry = skills["Brawling"];
  const selectedLevel = selectedEntry?.level ?? 0;
  const strikeBonus = (isMaSelected && selectedEntry?.keyAttacks?.strike) || 0;
  const kickBonus = (isMaSelected && selectedEntry?.keyAttacks?.kick) || 0;

  const punchTotal = ref.current + selectedLevel + strikeBonus;
  const kickTotal = ref.current + selectedLevel + kickBonus;

  const bonusDmg = isMaSelected ? `${dmSign} +${selectedLevel}` : `${dmSign}`;

  // Dodge bonuses from martial arts
  const dodgeBonuses = myMartialArts.filter(
    ([, e]) => e.keyAttacks?.dodge && e.keyAttacks.dodge > 0,
  );

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

      {dodgeBonuses.length > 0 && (
        <div class="melee-dodge-bonuses">
          <span class="melee-dodge-label">Dodge bonus:</span>
          {dodgeBonuses.map(([name, e], i) => (
            <span key={name}>
              {i > 0 && ", "}
              {name} <strong>+{e.keyAttacks!.dodge}</strong>
            </span>
          ))}
        </div>
      )}

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
          <div class="melee-card-skills">
            <button
              class={`label-chip melee-skill-btn${!isMaSelected ? " active" : ""}`}
              onClick={() => setUnarmedSkill("Brawling")}
            >
              <span class="label-chip-label">Brawling</span>
              <span class="label-chip-value">{brawlingEntry?.level ?? 0}</span>
            </button>
            {myMartialArts.map(([name, entry]) => (
              <button
                key={name}
                class={`label-chip melee-skill-btn${name === selectedName && isMaSelected ? " active" : ""}`}
                onClick={() => setUnarmedSkill(name)}
              >
                <span class="label-chip-label">{name}</span>
                <span class="label-chip-value">{entry.level}</span>
              </button>
            ))}
          </div>
        </div>
        <div class="cc-hero">
          <div class="cc-hero-cell">
            <span class="cc-hero-value">Punch 1D6/2 ({bonusDmg})</span>
          </div>
          <div class="cc-hero-cell">
            <span class="cc-hero-value">Kick 1D6 ({bonusDmg})</span>
          </div>
        </div>
        {strikeBonus > 0 || kickBonus > 0 ? (
          <div class="cc-hero">
            <div class="cc-hero-cell cc-hero-skill">
              <span class="cc-hero-total">+{punchTotal}</span>
              <span class="cc-hero-formula">
                {ref.current} + {selectedLevel}
                {strikeBonus > 0 && ` + ${strikeBonus}`}
              </span>
            </div>
            <div class="cc-hero-cell cc-hero-skill">
              <span class="cc-hero-total">+{kickTotal}</span>
              <span class="cc-hero-formula">
                {ref.current} + {selectedLevel}
                {kickBonus > 0 && ` + ${kickBonus}`}
              </span>
            </div>
          </div>
        ) : (
          <div class="cc-hero">
            <div class="cc-hero-cell cc-hero-skill">
              <span class="cc-hero-total">+{ref.current + selectedLevel}</span>
              <span class="cc-hero-formula">
                {ref.current} + {selectedLevel}
              </span>
            </div>
          </div>
        )}
      </div>

      <ManeuverTable martialArts={myMartialArts} />
    </div>
  );
}
