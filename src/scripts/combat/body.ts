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

/** Body Type tier table — single source of truth for BT thresholds */
const BT_TABLE: { max: number; name: BodyTypeName; dm: number; btm: number }[] =
  [
    { max: 2, name: "Very Weak", dm: -2, btm: 0 },
    { max: 4, name: "Weak", dm: -1, btm: 1 },
    { max: 7, name: "Average", dm: 0, btm: 2 },
    { max: 9, name: "Strong", dm: 1, btm: 3 },
    { max: 10, name: "Very Strong", dm: 2, btm: 4 },
    { max: 12, name: "Superhuman", dm: 4, btm: 5 },
    { max: 14, name: "Superhuman", dm: 6, btm: 5 },
    { max: Infinity, name: "Superhuman", dm: 8, btm: 5 },
  ];

function lookupBT(bt: number) {
  return BT_TABLE.find((row) => bt <= row.max)!;
}

export function getBodyTypeName(bt: number): BodyTypeName {
  return lookupBT(bt).name;
}

export function getDamageModifier(bt: number): number {
  return lookupBT(bt).dm;
}

export function getBTM(bt: number): number {
  return lookupBT(bt).btm;
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
