import type { WoundLevel } from "./wounds";
import { getWoundLevel } from "./wounds";

// --- Types and constants ---

export const STAT_NAMES = [
  "ref",
  "int",
  "cl",
  "tech",
  "lk",
  "att",
  "ma",
  "emp",
  "bt",
] as const;

export type StatName = (typeof STAT_NAMES)[number];

export const STAT_LABELS: Record<StatName, string> = {
  ref: "REF",
  int: "INT",
  cl: "CL",
  tech: "TECH",
  lk: "LK",
  att: "ATT",
  ma: "MA",
  emp: "EMP",
  bt: "BT",
};

export const STAT_FULL_NAMES: Record<StatName, string> = {
  int: "Intelligence",
  ref: "Reflexes",
  cl: "Cool",
  tech: "Technical Ability",
  lk: "Luck",
  att: "Attractiveness",
  ma: "Movement Allowance",
  emp: "Empathy",
  bt: "Body Type",
};

export interface StatValues {
  inherent: number;
  cyber: number;
  /** User-controlled misc bonus (drugs, GM buffs, etc.). */
  bonus: number;
  override?: number;
  total: number;
  current: number;
  penalties: string[];
}

export interface StatsState {
  ref: { inherent: number; bonus: number };
  int: { inherent: number; bonus: number };
  cl: { inherent: number; bonus: number };
  tech: { inherent: number; bonus: number };
  lk: { inherent: number; bonus: number };
  att: { inherent: number; bonus: number };
  ma: { inherent: number; bonus: number };
  emp: { inherent: number; bonus: number };
  bt: { inherent: number; bonus: number };
}

export type WoundPenaltyType = "ref" | "intcl" | "none";

export interface CalculateStatOptions {
  woundPenaltyType?: WoundPenaltyType;
  evPenalty?: number;
  stabilized?: boolean;
  cyberBonus?: number;
  cyberOverride?: number;
}

// --- Functions ---

function isMortal(level: WoundLevel): boolean {
  return level.startsWith("mortal");
}

// - SERIOUS: -2 REF only
// - CRITICAL: -4 REF only
// - MORTAL: -5 at mortal0, -6 at mortal1, etc. (REF only)
// - No INT/CL penalties
function getStablePenalty(
  woundLevel: WoundLevel | null,
  baseValue: number,
  type: WoundPenaltyType,
): number {
  if (!woundLevel || type !== "ref") return 0;

  switch (woundLevel) {
    case "light":
      return 0;
    case "serious":
      return 2;
    case "critical":
      return 4;
    default:
      if (isMortal(woundLevel)) {
        const mortalLevel = parseInt(woundLevel.slice(6), 10);
        return 5 + mortalLevel;
      }
      return 0;
  }
}

// - SERIOUS: -2 REF only
// - CRITICAL: REF/INT/CL → min(halving penalty, 2)
// - MORTAL: REF/INT/CL → min(thirding penalty, 4)
function getUnstablePenalty(
  woundLevel: WoundLevel | null,
  baseValue: number,
  type: WoundPenaltyType,
): number {
  if (!woundLevel || type === "none") return 0;

  switch (woundLevel) {
    case "light":
      return 0;
    case "serious":
      return type === "ref" ? 2 : 0;
    case "critical": {
      const halvingPenalty = baseValue - Math.ceil(baseValue / 2);
      return Math.min(halvingPenalty, 2);
    }
    default:
      if (isMortal(woundLevel)) {
        const thirdingPenalty = baseValue - Math.ceil(baseValue / 3);
        return Math.min(thirdingPenalty, 4);
      }
      return 0;
  }
}

export function getWoundPenalty(
  woundLevel: WoundLevel | null,
  baseValue: number,
  type: WoundPenaltyType = "ref",
  stabilized = false,
): number {
  return stabilized
    ? getStablePenalty(woundLevel, baseValue, type)
    : getUnstablePenalty(woundLevel, baseValue, type);
}

export function calculateStat(
  inherent: number,
  bonus: number,
  damage: number,
  options: CalculateStatOptions = {},
): StatValues {
  const {
    woundPenaltyType = "none",
    evPenalty = 0,
    stabilized = false,
    cyberBonus = 0,
    cyberOverride,
  } = options;

  // Override replaces inherent+cyber; user bonus still stacks on top.
  const base = cyberOverride != null ? cyberOverride : inherent + cyberBonus;
  const total = Math.max(0, base + bonus);
  const penalties: string[] = [];

  const woundLevel = damage > 0 ? getWoundLevel(damage) : null;
  const woundPenalty = getWoundPenalty(
    woundLevel,
    total,
    woundPenaltyType,
    stabilized,
  );

  if (woundPenalty > 0) {
    penalties.push(`Wounds(-${woundPenalty})`);
  }

  if (evPenalty > 0) {
    penalties.push(`EV(-${evPenalty})`);
  }

  const totalPenalty = woundPenalty + evPenalty;
  const current = Math.max(1, total - totalPenalty);

  return {
    inherent,
    cyber: cyberBonus,
    bonus,
    ...(cyberOverride != null ? { override: cyberOverride } : {}),
    total,
    current,
    penalties,
  };
}
