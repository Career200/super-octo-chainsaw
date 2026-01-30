import { getWoundLevel } from "./wounds";
import type {
  WoundLevel,
  WoundPenaltyType,
  CalculateStatOptions,
  StatValues,
} from "./types";

export function getWoundPenalty(
  woundLevel: WoundLevel | null,
  baseValue: number,
  type: WoundPenaltyType = "ref",
): number {
  if (!woundLevel || type === "none") return 0;

  switch (woundLevel) {
    case "light":
      return 0;
    case "serious":
      return type === "ref" ? 2 : 0;
    case "critical":
      return Math.max(Math.ceil(baseValue / 2), baseValue - 4);
    case "mortal0":
    case "mortal1":
    case "mortal2":
    case "mortal3":
    case "mortal4":
    case "mortal5":
    case "mortal6":
      return Math.max(Math.ceil(baseValue / 3), baseValue - 4);
    default:
      return 0;
  }
}

export function calculateStat(
  inherent: number,
  cyber: number,
  physicalDamage: number,
  options: CalculateStatOptions = {},
): StatValues {
  const { woundPenaltyType = "none", evPenalty = 0 } = options;

  const total = Math.max(0, inherent + cyber);
  const penalties: string[] = [];

  const woundLevel = physicalDamage > 0 ? getWoundLevel(physicalDamage) : null;
  const woundPenalty = getWoundPenalty(woundLevel, total, woundPenaltyType);

  if (woundPenalty > 0) {
    penalties.push(`Wounds(-${woundPenalty})`);
  }

  if (evPenalty > 0) {
    penalties.push(`EV(-${evPenalty})`);
  }

  const totalPenalty = woundPenalty + evPenalty;
  const current = Math.max(0, total - totalPenalty);

  return {
    inherent,
    cyber,
    total,
    current,
    penalties,
  };
}
