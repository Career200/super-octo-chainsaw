import { useStore } from "@nanostores/preact";

import type { StatValues } from "@scripts/combat/types";
import { $ATT, $CL, $EMP, $INT, $LK, $MA, $REF, $TECH } from "@stores/stats";

const STRIP_STATS = [
  { key: "ref", label: "REF", $store: $REF },
  { key: "int", label: "INT", $store: $INT },
  { key: "cl", label: "CL", $store: $CL },
  { key: "tech", label: "TECH", $store: $TECH },
  { key: "lk", label: "LK", $store: $LK },
  { key: "att", label: "ATT", $store: $ATT },
  { key: "ma", label: "MA", $store: $MA },
  { key: "emp", label: "EMP", $store: $EMP },
] as const;

const StatChip = ({
  $store,
  label,
}: {
  $store: (typeof STRIP_STATS)[number]["$store"];
  label: string;
}) => {
  const values: StatValues = useStore($store);
  const diminished = values.current < values.total;

  return (
    <span class="label-chip">
      <span class="label-chip-label">{label}</span>
      <span class={`label-chip-value${diminished ? " diminished" : ""}`}>
        {values.current}
      </span>
    </span>
  );
};

export const StatsStrip = () => {
  return (
    <div class="stats-strip">
      <div class="stats-strip-row">
        {STRIP_STATS.map((s) => (
          <StatChip key={s.key} $store={s.$store} label={s.label} />
        ))}
      </div>
    </div>
  );
};
