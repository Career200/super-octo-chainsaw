import { atom } from "nanostores";
import type { BodyPartName } from "../scripts/armor/core";
import type { DamageType } from "../scripts/armor/hit";

export interface ArmorDamageEntry {
  armorId: string;
  armorName: string;
  spLost: number;
}

export interface DamageHistoryEntry {
  type: "damage";
  id: string;
  timestamp: number;
  rawDamage: number;
  damageType: DamageType;
  bodyParts: BodyPartName[] | "none";
  effectiveSP: number;
  topProtector?: string;
  armorDamage: ArmorDamageEntry[];
  penetrating: number;
  ignoredArmor: boolean;
}

export interface ManipulationHistoryEntry {
  type: "manipulation";
  id: string;
  timestamp: number;
  armorId: string;
  armorName: string;
  bodyParts: BodyPartName[];
  oldSP: number;
  newSP: number;
}

export type HistoryEntry = DamageHistoryEntry | ManipulationHistoryEntry;

const STORAGE_KEY = "damage-history";

function loadState(): HistoryEntry[] {
  if (typeof localStorage === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as HistoryEntry[];
  } catch {
    return [];
  }
}

export const $damageHistory = atom<HistoryEntry[]>(loadState());

// Persist on change
$damageHistory.subscribe((state) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
});

let entryCounter = 0;

export function recordDamage(
  entry: Omit<DamageHistoryEntry, "id" | "timestamp" | "type">,
): DamageHistoryEntry {
  const fullEntry: DamageHistoryEntry = {
    ...entry,
    type: "damage",
    id: `dmg_${Date.now()}_${entryCounter++}`,
    timestamp: Date.now(),
  };

  $damageHistory.set([fullEntry, ...$damageHistory.get()]);
  return fullEntry;
}

export function recordManipulation(
  entry: Omit<ManipulationHistoryEntry, "id" | "timestamp" | "type">,
): ManipulationHistoryEntry {
  const fullEntry: ManipulationHistoryEntry = {
    ...entry,
    type: "manipulation",
    id: `man_${Date.now()}_${entryCounter++}`,
    timestamp: Date.now(),
  };

  $damageHistory.set([fullEntry, ...$damageHistory.get()]);
  return fullEntry;
}

export function clearHistory(): void {
  $damageHistory.set([]);
}
