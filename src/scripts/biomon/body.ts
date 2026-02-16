import type { WoundLevel } from "./types";

export type BodyTypeName =
  | "Very Weak"
  | "Weak"
  | "Average"
  | "Strong"
  | "Very Strong"
  | "Superhuman";

export interface BodyTypeInfo {
  value: number;
  name: BodyTypeName;
  btm: number;
  carry: number;
  deadlift: number;
  baseSave: number;
}

const STUN_SAVE_PENALTIES: Record<WoundLevel, number> = {
  light: 0,
  serious: -1,
  critical: -2,
  mortal0: -3,
  mortal1: -4,
  mortal2: -5,
  mortal3: -6,
  mortal4: -7,
  mortal5: -8,
  mortal6: -9,
};

const DEATH_SAVE_PENALTIES: Partial<Record<WoundLevel, number>> = {
  mortal0: 0,
  mortal1: -1,
  mortal2: -2,
  mortal3: -3,
  mortal4: -4,
  mortal5: -5,
  mortal6: -6,
};

function computeSave(
  baseSave: number,
  woundLevel: WoundLevel | null,
  penalties: Partial<Record<WoundLevel, number>>,
): number | null {
  if (!woundLevel) return null;
  const penalty = penalties[woundLevel];
  if (penalty === undefined) return null;
  return Math.max(0, baseSave + penalty);
}

export function getBodyTypeName(bt: number): BodyTypeName {
  if (bt <= 2) return "Very Weak";
  if (bt <= 4) return "Weak";
  if (bt <= 7) return "Average";
  if (bt <= 9) return "Strong";
  if (bt === 10) return "Very Strong";
  return "Superhuman";
}

export function getBTM(bt: number): number {
  if (bt <= 2) return 0;
  if (bt <= 4) return 1;
  if (bt <= 7) return 2;
  if (bt <= 9) return 3;
  if (bt === 10) return 4;
  return 5;
}

export function getBodyTypeInfo(bt: number): BodyTypeInfo {
  return {
    value: bt,
    name: getBodyTypeName(bt),
    btm: getBTM(bt),
    carry: bt * 10,
    deadlift: bt * 40,
    baseSave: bt,
  };
}

export function getStunSavePenalty(woundLevel: WoundLevel | null): number {
  if (!woundLevel) return 0;
  return STUN_SAVE_PENALTIES[woundLevel];
}

export function getCurrentSave(
  baseSave: number,
  woundLevel: WoundLevel | null,
): number {
  return computeSave(baseSave, woundLevel, STUN_SAVE_PENALTIES) ?? baseSave;
}

export function getDeathSave(
  baseSave: number,
  woundLevel: WoundLevel | null,
): number | null {
  return computeSave(baseSave, woundLevel, DEATH_SAVE_PENALTIES);
}
