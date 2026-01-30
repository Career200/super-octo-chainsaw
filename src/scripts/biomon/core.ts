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
}

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
  } else {
    return {
      physical: state.physical,
      stun: Math.min(TOTAL_BOXES, state.stun + amount),
    };
  }
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
  } else {
    return {
      physical: state.physical,
      stun: Math.max(state.physical, state.stun - amount),
    };
  }
}
