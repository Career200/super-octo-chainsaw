import { useStore } from "@nanostores/preact";

import { STAT_LABELS, STAT_NAMES, type StatName } from "@scripts/combat/types";
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

import { StatColumn } from "./StatColumn";

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

// Wrapper to isolate store subscription per stat
const StatColumnWrapper = ({ name }: { name: StatName }) => {
  const values = useStore(STAT_STORES[name]);
  return <StatColumn name={name} label={STAT_LABELS[name]} values={values} />;
};

export const StatsPanel = () => {
  return (
    <div class="stats-container">
      {STAT_NAMES.map((name) => (
        <StatColumnWrapper key={name} name={name} />
      ))}
    </div>
  );
};
