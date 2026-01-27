import { atom } from "nanostores";
import type { BodyPartName } from "../scripts/armor/core";

export type SkinWeaveLevel = 0 | 8 | 10 | 12 | 14;

export interface SkinWeaveState {
  level: SkinWeaveLevel; // 0 = not installed
  spByPart: Record<BodyPartName, number>;
}

const STORAGE_KEY = "skinweave";

function createDefaultSpByPart(level: SkinWeaveLevel): Record<BodyPartName, number> {
  return {
    head: level,
    torso: level,
    left_arm: level,
    right_arm: level,
    left_leg: level,
    right_leg: level,
  };
}

function loadState(): SkinWeaveState {
  if (typeof localStorage === "undefined") {
    return { level: 0, spByPart: createDefaultSpByPart(0) };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { level: 0, spByPart: createDefaultSpByPart(0) };
  }

  try {
    return JSON.parse(stored) as SkinWeaveState;
  } catch {
    return { level: 0, spByPart: createDefaultSpByPart(0) };
  }
}

export const $skinWeave = atom<SkinWeaveState>(loadState());

$skinWeave.subscribe((state) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
});

// --- Actions ---

export function setSkinWeaveLevel(level: SkinWeaveLevel): void {
  const current = $skinWeave.get();

  if (level === 0) {
    // Uninstall - reset everything
    $skinWeave.set({ level: 0, spByPart: createDefaultSpByPart(0) });
    return;
  }

  // When changing level, scale current SP proportionally or reset to max
  const newSpByPart = { ...current.spByPart };
  for (const part of Object.keys(newSpByPart) as BodyPartName[]) {
    if (current.level === 0) {
      // Fresh install - set to max
      newSpByPart[part] = level;
    } else {
      // Upgrade/downgrade - cap at new max
      newSpByPart[part] = Math.min(newSpByPart[part], level);
    }
  }

  $skinWeave.set({ level, spByPart: newSpByPart });
}

export function damageSkinWeave(part: BodyPartName, amount: number = 1): void {
  const state = $skinWeave.get();
  if (state.level === 0) return;

  const newSpByPart = {
    ...state.spByPart,
    [part]: Math.max(0, state.spByPart[part] - amount),
  };

  $skinWeave.set({ ...state, spByPart: newSpByPart });
}

export function repairSkinWeave(): void {
  const state = $skinWeave.get();
  if (state.level === 0) return;

  $skinWeave.set({ ...state, spByPart: createDefaultSpByPart(state.level) });
}

export function getSkinWeaveSP(part: BodyPartName): number {
  const state = $skinWeave.get();
  return state.level === 0 ? 0 : state.spByPart[part];
}

export function getSkinWeaveLevel(): SkinWeaveLevel {
  return $skinWeave.get().level;
}

export function isSkinWeaveInstalled(): boolean {
  return $skinWeave.get().level > 0;
}
