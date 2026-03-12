import type { Maneuver } from "@scripts/skills/catalog";
import type { SkillEntry } from "@stores/skills";

/** Maps table maneuver names to key attack identifiers (strike/kick are unarmed-only) */
const MANEUVER_KEY: Record<string, Maneuver | undefined> = {
  "Block/Parry": "block",
  Dodge: "dodge",
  Disarm: undefined,
  "Sweep/Trip": "sweep",
  Grapple: "grapple",
  Escape: "escape",
  Throw: "throw",
  Hold: "hold",
  Choke: "choke",
};

const MANEUVERS = [
  ["Block/Parry", "Absorb damage with your weapon"],
  ["Dodge", "\u22122 to attacker\u2019s hit roll"],
  ["Disarm", "Knock or remove weapon"],
  ["Sweep/Trip", "Opponent \u22122 next attack; you +2 next attack"],
  ["Grapple", "Block enemy movement. Prerequisite for Throw/Choke/Hold"],
  ["Escape", "Break free of hold"],
  ["Throw", "Req Grapple. 1D6+DM, stun at \u22122"],
  ["Hold", "Req Grapple. Immobilized until Escape"],
  ["Choke", "Req Hold/Grapple prev. 1D6/turn"],
] as const;

interface Props {
  martialArts: [string, SkillEntry][];
}

export const ManeuverTable = ({ martialArts }: Props) => (
  <div class="melee-maneuvers">
    {MANEUVERS.map(([name, desc]) => {
      const key = MANEUVER_KEY[name];
      const bonuses =
        key && martialArts.length > 0
          ? martialArts
              .filter(([, e]) => e.keyAttacks?.[key])
              .map(([n, e]) => ({ name: n, bonus: e.keyAttacks![key]! }))
          : [];

      return (
        <div key={name} class="melee-maneuver-row">
          <span class="melee-maneuver-name">{name}</span>
          <span class="melee-maneuver-desc">{desc}</span>
          {bonuses.length > 0 && (
            <span class="melee-maneuver-bonuses">
              {bonuses.map((b) => (
                <span key={b.name} class="melee-maneuver-bonus">
                  {b.name} <strong>+{b.bonus}</strong>
                </span>
              ))}
            </span>
          )}
        </div>
      );
    })}
  </div>
);
