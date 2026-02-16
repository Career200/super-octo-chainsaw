import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";
import { $health } from "./health";
import { $encumbrance } from "./armor";
import { calculateStat } from "@scripts/biomon/stats";
import { getWoundLevel } from "@scripts/biomon/wounds";
import {
  getBodyTypeInfo,
  getStunSavePenalty,
  getCurrentSave,
  getDeathSave,
  type BodyTypeInfo,
} from "@scripts/biomon/body";
import type { ReadableAtom } from "nanostores";
import type { StatsState, StatName, StatValues } from "@scripts/biomon/types";

function defaultState(): StatsState {
  return {
    ref: { inherent: 8, cyber: 0 },
    int: { inherent: 8, cyber: 0 },
    cl: { inherent: 8, cyber: 0 },
    tech: { inherent: 8, cyber: 0 },
    lk: { inherent: 8, cyber: 0 },
    att: { inherent: 8, cyber: 0 },
    ma: { inherent: 8, cyber: 0 },
    emp: { inherent: 8, cyber: 0 },
    bt: { inherent: 8, cyber: 0 },
  };
}

export const $stats = persistentAtom<StatsState>("character-stats", defaultState(), {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// --- Computed stats ---

export const $REF = computed(
  [$stats, $health, $encumbrance],
  (stats, health, encumbrance): StatValues =>
    calculateStat(stats.ref.inherent, stats.ref.cyber, health.stun, {
      woundPenaltyType: "ref",
      evPenalty: encumbrance.ev,
      stabilized: health.stabilized,
    }),
);

export const $INT = computed(
  [$stats, $health],
  (stats, health): StatValues =>
    calculateStat(stats.int.inherent, stats.int.cyber, health.stun, {
      woundPenaltyType: "intcl",
      stabilized: health.stabilized,
    }),
);

export const $CL = computed(
  [$stats, $health],
  (stats, health): StatValues =>
    calculateStat(stats.cl.inherent, stats.cl.cyber, health.stun, {
      woundPenaltyType: "intcl",
      stabilized: health.stabilized,
    }),
);

export const $TECH = computed(
  [$stats, $health],
  (stats, health): StatValues =>
    calculateStat(stats.tech.inherent, stats.tech.cyber, health.stun, {
      woundPenaltyType: "intcl",
      stabilized: health.stabilized,
    }),
);

export const $LK = computed(
  [$stats],
  (stats): StatValues =>
    // special logic later
    calculateStat(stats.lk.inherent, stats.lk.cyber, 0),
);

export const $ATT = computed(
  [$stats],
  (stats): StatValues => calculateStat(stats.att.inherent, stats.att.cyber, 0),
);

export const $MA = computed(
  [$stats, $health],
  (stats, health): StatValues =>
    calculateStat(stats.ma.inherent, stats.ma.cyber, health.stun, {
      woundPenaltyType: "ref",
      stabilized: health.stabilized,
    }),
);

export const $EMP = computed(
  [$stats],
  (stats): StatValues => calculateStat(stats.emp.inherent, stats.emp.cyber, 0),
);

export const $BT = computed(
  [$stats],
  (stats): StatValues =>
    // major logic later
    calculateStat(stats.bt.inherent, stats.bt.cyber, 0),
);

export const STAT_STORES: Record<StatName, ReadableAtom<StatValues>> = {
  ref: $REF, int: $INT, cl: $CL, tech: $TECH,
  lk: $LK, att: $ATT, ma: $MA, emp: $EMP, bt: $BT,
};

export interface BodyTypeState extends BodyTypeInfo {
  savePenalty: number;
  currentSave: number;
  deathSave: number | null;
  stabilized: boolean;
}

export const $bodyType = computed(
  [$BT, $health],
  (bt, health): BodyTypeState => {
    const info = getBodyTypeInfo(bt.total);
    const woundLevel = health.stun > 0 ? getWoundLevel(health.stun) : null;
    const savePenalty = getStunSavePenalty(woundLevel);
    const currentSave = getCurrentSave(info.baseSave, woundLevel);
    const deathSave = getDeathSave(info.baseSave, woundLevel);
    return { ...info, savePenalty, currentSave, deathSave, stabilized: health.stabilized };
  },
);

// --- Actions ---

export function setStatInherent(stat: keyof StatsState, value: number): void {
  const clamped = Math.max(0, Math.round(value));
  const current = $stats.get();
  $stats.set({
    ...current,
    [stat]: { ...current[stat], inherent: clamped },
  });
}

export function setStatCyber(stat: keyof StatsState, value: number): void {
  const clamped = Math.max(0, Math.round(value));
  const current = $stats.get();
  $stats.set({
    ...current,
    [stat]: { ...current[stat], cyber: clamped },
  });
}
