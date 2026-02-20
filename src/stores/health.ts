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

export function isMortal(physical: number): boolean {
  return physical > MORTAL_THRESHOLD;
}

// --- Actions ---

export function takeDamage(amount: number, type: DamageType): void {
  const current = $health.get();
  const newState = applyDamage(current, amount, type);

  // Auto-destabilize when crossing into mortal
  const crossingMortal =
    !isMortal(current.physical) && isMortal(newState.physical);
  $health.set({
    ...newState,
    stabilized: crossingMortal ? false : newState.stabilized,
  });
}

export function heal(amount: number, type: DamageType): void {
  $health.set(healDamage($health.get(), amount, type));
}

export function setDamage(
  amount: number,
  type: DamageType,
  syncStun = false,
): void {
  const clamped = Math.max(0, Math.min(TOTAL_BOXES, amount));
  const current = $health.get();

  if (type === "physical") {
    const crossingMortal = !isMortal(current.physical) && isMortal(clamped);

    // Auto-destabilize when crossing into mortal
    const stabilized = crossingMortal ? false : current.stabilized;

    $health.set({
      physical: clamped,
      stun: syncStun ? clamped : Math.max(current.stun, clamped),
      stabilized,
    });
  } else {
    $health.set({
      physical: current.physical,
      stun: Math.max(current.physical, clamped),
      stabilized: current.stabilized,
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
