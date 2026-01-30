import { atom, computed } from "nanostores";
import { $health } from "./health";
import { $encumbrance } from "./armor";
import {
  calculateREF,
  type StatsState,
  type StatValues,
} from "../scripts/biomon/stats";

const STORAGE_KEY = "character-stats";

function loadState(): StatsState {
  if (typeof localStorage === "undefined") {
    return { ref: { inherent: 8, cyber: 0 } };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { ref: { inherent: 8, cyber: 0 } };

  try {
    return JSON.parse(stored) as StatsState;
  } catch {
    return { ref: { inherent: 8, cyber: 0 } };
  }
}

export const $stats = atom<StatsState>(loadState());

// Persist on change
$stats.subscribe((state) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
});

// --- Computed: REF with all modifiers ---
export const $REF = computed(
  [$stats, $health, $encumbrance],
  (stats, health, encumbrance): StatValues => {
    return calculateREF(
      stats.ref.inherent,
      stats.ref.cyber,
      health.physical,
      encumbrance.ev,
    );
  },
);

// --- Actions ---

export function setStatInherent(stat: keyof StatsState, value: number): void {
  const clamped = Math.max(0, Math.round(value));
  const current = $stats.get();
  $stats.set({
    ...current,
    [stat]: { ...current[stat], inherent: clamped },
  });
}

export function setStatCyber(stat: keyof StatsState, value: number): void {
  const clamped = Math.max(0, Math.round(value));
  const current = $stats.get();
  $stats.set({
    ...current,
    [stat]: { ...current[stat], cyber: clamped },
  });
}
