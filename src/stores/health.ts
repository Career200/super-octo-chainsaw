import { persistentAtom } from "@nanostores/persistent";

import {
  BOXES_PER_LEVEL,
  type DamageType,
  TOTAL_BOXES,
  type WoundState,
} from "@scripts/combat/types";
import { applyDamage, healDamage } from "@scripts/combat/wounds";

// Mortal starts at box 13 (after 3 levels of 4 boxes each)
const MORTAL_THRESHOLD = 3 * BOXES_PER_LEVEL;

function defaultState(): WoundState {
  return { physical: 0, stun: 0, stabilized: false };
}

export const $health = persistentAtom<WoundState>(
  "health-state",
  defaultState(),
  {
    encode: JSON.stringify,
    decode: (raw: string): WoundState => {
      try {
        return JSON.parse(raw);
      } catch {
        return defaultState();
      }
    },
  },
);

// --- Helpers ---

export function isMortal(stun: number): boolean {
  return stun > MORTAL_THRESHOLD;
}

// --- Actions ---

export function takeDamage(amount: number, type: DamageType): void {
  const current = $health.get();
  const newState = applyDamage(current, amount, type);

  // Auto-destabilize when in mortal
  $health.set({
    ...newState,
    stabilized: isMortal(newState.stun) ? false : newState.stabilized,
  });
}

export function heal(amount: number, type: DamageType): void {
  const newState = healDamage($health.get(), amount, type);
  // Auto-clear stabilization when dropping below mortal
  $health.set({
    ...newState,
    stabilized: isMortal(newState.stun) ? newState.stabilized : false,
  });
}

export function setDamage(
  amount: number,
  type: DamageType,
  syncStun = false,
): void {
  const clamped = Math.max(0, Math.min(TOTAL_BOXES, amount));
  const current = $health.get();

  if (type === "physical") {
    $health.set({
      physical: clamped,
      stun: syncStun ? clamped : Math.max(current.stun, clamped),
      stabilized: false,
    });
  } else {
    $health.set({
      physical: current.physical,
      stun: Math.max(current.physical, clamped),
      stabilized: false,
    });
  }
}

export function setStabilized(stabilized: boolean): void {
  const current = $health.get();
  $health.set({ ...current, stabilized });
}

export function syncStunToPhysical(): void {
  const current = $health.get();
  $health.set({
    physical: current.physical,
    stun: current.physical,
    stabilized: current.stabilized,
  });
}

export function resetHealth(): void {
  $health.set(defaultState());
}
