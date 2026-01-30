import { atom, computed } from "nanostores";
import { $health } from "./health";
import { $encumbrance } from "./armor";
import { calculateStat } from "@scripts/biomon/stats";
import type { StatsState, StatValues } from "@scripts/biomon/types";

const STORAGE_KEY = "character-stats";

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

function loadState(): StatsState {
  const defaults = defaultState();

  if (typeof localStorage === "undefined") {
    return defaults;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaults;

  try {
    const parsed = JSON.parse(stored) as Partial<StatsState>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export const $stats = atom<StatsState>(loadState());

$stats.subscribe((state) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
});

// --- Computed stats ---

export const $REF = computed(
  [$stats, $health, $encumbrance],
  (stats, health, encumbrance): StatValues =>
    calculateStat(stats.ref.inherent, stats.ref.cyber, health.physical, {
      woundPenaltyType: "ref",
      evPenalty: encumbrance.ev,
    }),
);

export const $INT = computed([$stats, $health], (stats, health): StatValues =>
  calculateStat(stats.int.inherent, stats.int.cyber, health.physical, {
    woundPenaltyType: "intcl",
  }),
);

export const $CL = computed([$stats, $health], (stats, health): StatValues =>
  calculateStat(stats.cl.inherent, stats.cl.cyber, health.physical, {
    woundPenaltyType: "intcl",
  }),
);

export const $TECH = computed([$stats], (stats): StatValues =>
  calculateStat(stats.tech.inherent, stats.tech.cyber, 0),
);

export const $LK = computed([$stats], (stats): StatValues =>
  // special logic later
  calculateStat(stats.lk.inherent, stats.lk.cyber, 0),
);

export const $ATT = computed([$stats], (stats): StatValues =>
  calculateStat(stats.att.inherent, stats.att.cyber, 0),
);

export const $MA = computed([$stats], (stats): StatValues =>
  calculateStat(stats.ma.inherent, stats.ma.cyber, 0),
);

export const $EMP = computed([$stats], (stats): StatValues =>
  calculateStat(stats.emp.inherent, stats.emp.cyber, 0),
);

export const $BT = computed([$stats], (stats): StatValues =>
  // major logic later
  calculateStat(stats.bt.inherent, stats.bt.cyber, 0),
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
