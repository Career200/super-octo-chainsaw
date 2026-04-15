import { useStore } from "@nanostores/preact";

import { STAT_LABELS, STAT_NAMES, type StatName } from "@scripts/combat/stats";
import {
  $ATT,
  $BT,
  $CL,
  $EMP,
  $INT,
  $LK,
  $MA,
  $REF,
  $TECH,
} from "@stores/stats";
import { $selectedStat, selectStat } from "@stores/ui";

const STAT_STORES = {
  ref: $REF,
  int: $INT,
  cl: $CL,
  tech: $TECH,
  lk: $LK,
  att: $ATT,
  ma: $MA,
  emp: $EMP,
  bt: $BT,
} as const;

const StatCard = ({ name }: { name: StatName }) => {
  const values = useStore(STAT_STORES[name]);
  const selected = useStore($selectedStat);
  const isDiminished = values.current < values.total;
  const isSelected = selected === name;

  return (
    <button
      class={`stat-card${isSelected ? " active" : ""}`}
      data-stat={name}
      onClick={() => selectStat(isSelected ? null : name)}
    >
      <span class={`stat-card-value${isDiminished ? " diminished" : ""}`}>
        {values.current}
      </span>
      <span class="stat-card-label">{STAT_LABELS[name]}</span>
      <span class="stat-card-chevron">›››</span>
    </button>
  );
};

export const StatsPanel = () => {
  return (
    <div class="stats-container">
      {STAT_NAMES.map((name) => (
        <StatCard key={name} name={name} />
      ))}
    </div>
  );
};
