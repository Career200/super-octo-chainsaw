import type { StatName, StatValues } from "@scripts/combat/types";
import { setStatCyber, setStatInherent } from "@stores/stats";

const STAT_DESCRIPTIONS: Record<StatName, string> = {
  int: "How generally bright you are.",
  ref: "Combat speed and initiative.",
  cl: "Willpower, mental resilience, ability to stay calm under pressure.",
  tech: "Ability to manipulate tools or instruments.",
  lk: "How lucky you are. Usable as a pool to modify critical rolls.",
  att: "How good-looking you are.",
  ma: "How fast you can run. Determines movement per turn.",
  emp: "Ability to relate to and care about others. Reduced by cyberware.",
  bt: "Strength and endurance. Determines hit points, carry, and damage bonus.",
};

interface Props {
  name: StatName;
  values: StatValues;
}

const clamp = (num?: number) => Math.min(Math.max(num ?? 0, 0), 99);

export function StatDetail({ name, values }: Props) {
  // Placeholder: cyber bonus from $cyberEffects (will wire in M2)
  const cyberBonus = 0;

  return (
    <div class="stat-detail">
      <div class="weapon-detail-stats">
        <label class="weapon-detail-stat">
          <span class="weapon-detail-label">Base</span>
          <input
            type="number"
            class="stat-detail-input"
            value={values.inherent}
            min={0}
            max={20}
            onInput={(e) => {
              const v = clamp(parseInt(e.currentTarget.value, 10));
              setStatInherent(name, v);
            }}
          />
        </label>
        {cyberBonus !== 0 && (
          <span class="weapon-detail-stat">
            <span class="weapon-detail-label">Cyber</span>
            <span class="stat-detail-cyber">
              {cyberBonus > 0 ? `+${cyberBonus}` : cyberBonus}
            </span>
          </span>
        )}
        {values.penalties.length > 0 && (
          <span class="weapon-detail-stat">
            <span class="weapon-detail-label">Penalties</span>
            <span class="stat-detail-penalty">
              {values.penalties.join(" ")}
            </span>
          </span>
        )}
        <label class="weapon-detail-stat">
          <span class="weapon-detail-label">Bonus</span>
          <input
            type="number"
            class="stat-detail-input"
            value={values.cyber}
            min={-10}
            max={10}
            onInput={(e) => {
              const v = clamp(parseInt(e.currentTarget.value, 10));
              setStatCyber(name, v);
            }}
          />
        </label>
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">Current</span>
          <span
            class={`stat-detail-current${values.current < values.total ? " diminished" : ""}`}
          >
            {values.current}
          </span>
        </span>
      </div>
      <p class="text-desc">{STAT_DESCRIPTIONS[name]}</p>
    </div>
  );
}
