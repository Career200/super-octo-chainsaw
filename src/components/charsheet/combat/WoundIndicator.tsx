import { useStore } from "@nanostores/preact";

import { WOUND_LEVEL_NAMES } from "@scripts/combat/types";
import { getWoundLevel } from "@scripts/combat/wounds";
import { $health } from "@stores/health";

export default function WoundIndicator() {
  const health = useStore($health);
  const level = getWoundLevel(health.physical);

  if (!level) return null;

  const isMortal = level.startsWith("mortal");
  const name = WOUND_LEVEL_NAMES[level];

  return (
    <span class={`label-chip${isMortal ? " label-chip-danger" : ""}`}>
      <span class="label-chip-label">Wounds</span>
      <span class="label-chip-value">{health.physical}</span>
      <span class="label-chip-label">({name})</span>
    </span>
  );
}
