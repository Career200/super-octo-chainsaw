import { atom } from "nanostores";
import {
  TOTAL_BOXES,
  BOXES_PER_LEVEL,
  type WoundState,
  type DamageType,
} from "@scripts/biomon/types";
import { applyDamage, healDamage } from "@scripts/biomon/wounds";

const STORAGE_KEY = "health-state";

// Mortal starts at box 13 (after 3 levels of 4 boxes each)
const MORTAL_THRESHOLD = 3 * BOXES_PER_LEVEL;

function defaultState(): WoundState {
  return { physical: 0, stun: 0, stabilized: false };
}

function loadState(): WoundState {
  const defaults = defaultState();

  if (typeof localStorage === "undefined") {
    return defaults;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaults;

  try {
    const parsed = JSON.parse(stored) as Partial<WoundState>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export const $health = atom<WoundState>(loadState());

// Persist on change
$health.subscribe((state) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
});

// --- Helpers ---

function isMortal(physical: number): boolean {
  return physical > MORTAL_THRESHOLD;
}

// --- Actions ---

export function takeDamage(amount: number, type: DamageType): void {
  const current = $health.get();
  const newState = applyDamage(current, amount, type);

  // Auto-destabilize when crossing into mortal
  const crossingMortal = !isMortal(current.physical) && isMortal(newState.physical);
  $health.set({ ...newState, stabilized: crossingMortal ? false : newState.stabilized });
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
