import type { StatName, StatValues } from "@scripts/combat/types";
import { setStatCyber, setStatInherent } from "@stores/stats";

interface Props {
  name: StatName;
  label: string;
  values: StatValues;
}

export const StatColumn = ({ name, label, values }: Props) => {
  const isDiminished = values.current < values.total;

  const handleChange = (field: "inherent" | "cyber", value: number) => {
    if (field === "inherent") {
      setStatInherent(name, value);
    } else {
      setStatCyber(name, value);
    }
  };

  return (
    <div class="stat-column" data-stat={name}>
      <div class="stat-name">{label}</div>
      <div class="stat-row stat-inherent">
        <span class="stat-label">Base</span>
        <input
          type="number"
          class="stat-input"
          value={values.inherent}
          min={0}
          max={20}
          onInput={(e) =>
            handleChange("inherent", parseInt(e.currentTarget.value, 10) || 0)
          }
        />
      </div>
      <div class="stat-row stat-cyber">
        <span class="stat-label">Cyber</span>
        <input
          type="number"
          class="stat-input"
          value={values.cyber}
          min={0}
          max={10}
          onInput={(e) =>
            handleChange("cyber", parseInt(e.currentTarget.value, 10) || 0)
          }
        />
      </div>
      <div class="stat-row stat-total">
        <span class="stat-label">Total</span>
        <span class="stat-value">{values.total}</span>
      </div>
      <div class="stat-penalties">{values.penalties.join("")}</div>
      <div class={`stat-row stat-current ${isDiminished ? "diminished" : ""}`}>
        <span class="stat-label">Current</span>
        <span class="stat-value">{values.current}</span>
      </div>
    </div>
  );
};
