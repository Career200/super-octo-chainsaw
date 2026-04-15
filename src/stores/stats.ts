import { persistentAtom } from "@nanostores/persistent";
import type { ReadableAtom } from "nanostores";
import { computed } from "nanostores";

import {
  type BodyTypeInfo,
  getBodyTypeInfo,
  getCurrentSave,
  getDeathSave,
  getStunSavePenalty,
} from "@scripts/combat/body";
import {
  calculateStat,
  type StatName,
  type StatsState,
  type StatValues,
  type WoundPenaltyType,
} from "@scripts/combat/stats";
import { getWoundLevel } from "@scripts/combat/wounds";

import { $armorEffects } from "./armor/effects";
import { $cyberEffects } from "./cyber-effects";
import { decodeJson } from "./decode";
import { $health } from "./health";

function defaultState(): StatsState {
  return {
    ref: { inherent: 8, bonus: 0 },
    int: { inherent: 8, bonus: 0 },
    cl: { inherent: 8, bonus: 0 },
    tech: { inherent: 8, bonus: 0 },
    lk: { inherent: 8, bonus: 0 },
    att: { inherent: 8, bonus: 0 },
    ma: { inherent: 8, bonus: 0 },
    emp: { inherent: 8, bonus: 0 },
    bt: { inherent: 8, bonus: 0 },
  };
}

export const $stats = persistentAtom<StatsState>(
  "character-stats",
  defaultState(),
  {
    encode: JSON.stringify,
    decode: decodeJson(defaultState()),
  },
);

// --- Computed stats ---

function makeStatStore(
  key: StatName,
  penaltyType?: WoundPenaltyType,
  withEV?: boolean,
): ReadableAtom<StatValues> {
  return computed(
    [$stats, $health, $armorEffects, $cyberEffects],
    (stats, health, armorEffects, cyber): StatValues =>
      calculateStat(stats[key].inherent, stats[key].bonus ?? 0, health.stun, {
        woundPenaltyType: penaltyType,
        evPenalty: withEV ? armorEffects.ev : 0,
        stabilized: health.stabilized,
        cyberBonus: cyber.statBonuses[key],
        cyberOverride: cyber.statOverrides[key],
      }),
  );
}

export const $REF = makeStatStore("ref", "ref", true);
export const $INT = makeStatStore("int", "intcl");
export const $CL = makeStatStore("cl", "intcl");
export const $TECH = makeStatStore("tech", "intcl");
export const $LK = makeStatStore("lk");
export const $ATT = makeStatStore("att");
export const $MA = makeStatStore("ma", "ref");
export const $EMP = makeStatStore("emp");
export const $BT = makeStatStore("bt");

export const STAT_STORES: Record<StatName, ReadableAtom<StatValues>> = {
  ref: $REF,
  int: $INT,
  cl: $CL,
  tech: $TECH,
  lk: $LK,
  att: $ATT,
  ma: $MA,
  emp: $EMP,
  bt: $BT,
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
    return {
      ...info,
      savePenalty,
      currentSave,
      deathSave,
      stabilized: health.stabilized,
    };
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

export function setStatBonus(stat: keyof StatsState, value: number): void {
  const clamped = Math.round(value);
  const current = $stats.get();
  $stats.set({
    ...current,
    [stat]: { ...current[stat], bonus: clamped },
  });
}
