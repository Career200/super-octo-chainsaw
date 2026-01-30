import {
  WOUND_LEVELS,
  BOXES_PER_LEVEL,
  TOTAL_BOXES,
  type WoundLevel,
  type WoundState,
  type DamageType,
} from "./types";

export function getWoundLevel(boxes: number): WoundLevel | null {
  if (boxes <= 0) return null;
  const levelIndex = Math.min(
    Math.floor((boxes - 1) / BOXES_PER_LEVEL),
    WOUND_LEVELS.length - 1,
  );
  return WOUND_LEVELS[levelIndex];
}

export function applyDamage(
  state: WoundState,
  amount: number,
  type: DamageType,
): WoundState {
  if (type === "physical") {
    return {
      physical: Math.min(TOTAL_BOXES, state.physical + amount),
      stun: Math.min(TOTAL_BOXES, state.stun + amount),
    };
  }
  return {
    physical: state.physical,
    stun: Math.min(TOTAL_BOXES, state.stun + amount),
  };
}

export function healDamage(
  state: WoundState,
  amount: number,
  type: DamageType,
): WoundState {
  if (type === "physical") {
    return {
      physical: Math.max(0, state.physical - amount),
      stun: state.stun,
    };
  }
  return {
    physical: state.physical,
    stun: Math.max(state.physical, state.stun - amount),
  };
}
