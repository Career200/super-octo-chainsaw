import { useStore } from "@nanostores/preact";
import {
  $REF,
  $INT,
  $CL,
  $TECH,
  $LK,
  $ATT,
  $MA,
  $EMP,
  $BT,
} from "@stores/stats";
import { STAT_NAMES, STAT_LABELS, type StatName } from "@scripts/biomon/types";
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
