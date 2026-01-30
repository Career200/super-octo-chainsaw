import { atom } from "nanostores";
import { TOTAL_BOXES, type WoundState, type DamageType } from "@scripts/biomon/types";
import { applyDamage, healDamage } from "@scripts/biomon/wounds";

const STORAGE_KEY = "health-state";

function loadState(): WoundState {
  if (typeof localStorage === "undefined") {
    return { physical: 0, stun: 0 };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { physical: 0, stun: 0 };

  try {
    return JSON.parse(stored) as WoundState;
  } catch {
    return { physical: 0, stun: 0 };
  }
}

export const $health = atom<WoundState>(loadState());

// Persist on change
$health.subscribe((state) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
});

// --- Actions ---

export function takeDamage(amount: number, type: DamageType): void {
  $health.set(applyDamage($health.get(), amount, type));
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
    $health.set({
      physical: clamped,
      stun: syncStun ? clamped : Math.max(current.stun, clamped),
    });
  } else {
    $health.set({
      physical: current.physical,
      stun: Math.max(current.physical, clamped),
    });
  }
}

export function syncStunToPhysical(): void {
  const current = $health.get();
  $health.set({
    physical: current.physical,
    stun: current.physical,
  });
}

export function resetHealth(): void {
  $health.set({ physical: 0, stun: 0 });
}
