import { getWoundLevel, type WoundLevel } from "./core";

export type StatName = "ref";

export interface StatValues {
  inherent: number;
  cyber: number;
  total: number;
  current: number; // with penalties (wounds, EV, ...chems?)
}

export interface StatsState {
  ref: { inherent: number; cyber: number };
}

export function getWoundPenalty(
  woundLevel: WoundLevel | null,
  baseValue: number,
): number {
  if (!woundLevel) return 0;

  switch (woundLevel) {
    case "light":
      return 0;
    case "serious":
      return 2; // flat -2
    case "critical":
      return baseValue - Math.ceil(baseValue / 2);
    case "mortal0":
    case "mortal1":
    case "mortal2":
    case "mortal3":
    case "mortal4":
    case "mortal5":
    case "mortal6":
      return baseValue - Math.ceil(baseValue / 3);
    default:
      return 0;
  }
}

export function calculateStat(
  inherent: number,
  cyber: number,
  woundLevel: WoundLevel | null,
  evPenalty: number,
): StatValues {
  const total = Math.max(0, inherent + cyber);
  const woundPenalty = getWoundPenalty(woundLevel, total);
  const current = Math.max(0, total - woundPenalty - evPenalty);

  return {
    inherent,
    cyber,
    total,
    current,
  };
}

export function calculateREF(
  inherent: number,
  cyber: number,
  physicalDamage: number,
  evPenalty: number,
): StatValues {
  const woundLevel = getWoundLevel(physicalDamage);
  return calculateStat(inherent, cyber, woundLevel, evPenalty);
}
