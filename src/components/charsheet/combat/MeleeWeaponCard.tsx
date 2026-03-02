import type { SkillEntry } from "@stores/skills";
import type { WeaponPiece } from "@stores/weapons";
import { setMeleeSkill } from "@stores/weapons";

interface Props {
  weapon: WeaponPiece;
  dmSign: string;
  meleeSkills: [string, SkillEntry][];
  refCurrent: number;
}

export const MeleeWeaponCard = ({
  weapon,
  dmSign,
  meleeSkills,
  refCurrent,
}: Props) => {
  const selected = weapon.meleeSkill ?? weapon.skill;
  const skillLevel =
    meleeSkills.find(([name]) => name === selected)?.[1]?.level ?? 0;
  const total = refCurrent + skillLevel + weapon.wa;

  return (
    <div class="combat-card">
      <div class="cc-header">
        <div class="cc-name">
          {weapon.name}
          {weapon.wa !== 0 && (
            <span class="cc-melee-wa">
              {" "}
              WA {weapon.wa >= 0 ? "+" : ""}
              {weapon.wa}
            </span>
          )}
        </div>
        <div class="melee-card-skills">
          {meleeSkills.map(([name, entry]) => (
            <button
              key={name}
              class={`label-chip melee-skill-btn${name === selected ? " active" : ""}`}
              onClick={() => setMeleeSkill(weapon.id, name)}
            >
              <span class="label-chip-label">{name}</span>
              <span class="label-chip-value">{entry.level}</span>
            </button>
          ))}
        </div>
        <span class="cc-hero-label">{weapon.reliability}</span>
      </div>
      <div class="cc-hero">
        <div class="cc-hero-cell">
          <span class="cc-hero-value">
            {weapon.damage} ({dmSign})
          </span>
        </div>
        <div class="cc-hero-cell cc-hero-skill">
          <span class="cc-hero-total">+{total}</span>
          <span class="cc-hero-formula">
            REF {refCurrent} + {selected} {skillLevel} + WA {weapon.wa}
          </span>
        </div>
      </div>
      {weapon.effects && <div class="cc-effect">{weapon.effects}</div>}
    </div>
  );
};
