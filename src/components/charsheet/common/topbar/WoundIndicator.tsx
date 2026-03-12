import { useStore } from "@nanostores/preact";

import { WOUND_LEVEL_NAMES } from "@scripts/combat/types";
import { getWoundLevel } from "@scripts/combat/wounds";
import { $health } from "@stores/health";

export default function WoundIndicator() {
  const health = useStore($health);
  const level = getWoundLevel(health.physical);

  if (!level) return null;

  const name = WOUND_LEVEL_NAMES[level];

  const colorClass = level.startsWith("mortal")
    ? " label-chip-danger"
    : level === "critical"
      ? " label-chip-critical"
      : level === "serious"
        ? " label-chip-warning"
        : "";

  return (
    <span class={`label-chip${colorClass}`}>
      <span class="label-chip-label">Wounds</span>
      <span class="label-chip-value">{health.physical}</span>
      <span class="label-chip-label">({name})</span>
    </span>
  );
}
