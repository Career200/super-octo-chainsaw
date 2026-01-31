// --- Wound types and constants ---

export const WOUND_LEVELS = [
  "light",
  "serious",
  "critical",
  "mortal0",
  "mortal1",
  "mortal2",
  "mortal3",
  "mortal4",
  "mortal5",
  "mortal6",
] as const;

export type WoundLevel = (typeof WOUND_LEVELS)[number];

export const WOUND_LEVEL_NAMES: Record<WoundLevel, string> = {
  light: "Light",
  serious: "Serious",
  critical: "Critical",
  mortal0: "Mortal 0",
  mortal1: "Mortal 1",
  mortal2: "Mortal 2",
  mortal3: "Mortal 3",
  mortal4: "Mortal 4",
  mortal5: "Mortal 5",
  mortal6: "Mortal 6",
};

export const BOXES_PER_LEVEL = 4;
export const TOTAL_BOXES = WOUND_LEVELS.length * BOXES_PER_LEVEL; // 40

export type DamageType = "physical" | "stun";

export interface WoundState {
  physical: number;
  stun: number;
  stabilized: boolean;
}

// --- Stat types and constants ---

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

export interface StatValues {
  inherent: number;
  cyber: number;
  total: number;
  current: number;
  penalties: string[];
}

export interface StatsState {
  ref: { inherent: number; cyber: number };
  int: { inherent: number; cyber: number };
  cl: { inherent: number; cyber: number };
  tech: { inherent: number; cyber: number };
  lk: { inherent: number; cyber: number };
  att: { inherent: number; cyber: number };
  ma: { inherent: number; cyber: number };
  emp: { inherent: number; cyber: number };
  bt: { inherent: number; cyber: number };
}

export type WoundPenaltyType = "ref" | "intcl" | "none";

export interface CalculateStatOptions {
  woundPenaltyType?: WoundPenaltyType;
  evPenalty?: number;
  stabilized?: boolean;
}
