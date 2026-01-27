import { atom } from "nanostores";
import type { BodyPartName } from "../scripts/armor/core";
import type { DamageType } from "../scripts/armor/hit";

export interface ArmorDamageEntry {
  armorId: string;
  armorName: string;
  spLost: number;
}

export interface DamageHistoryEntry {
  id: string;
  timestamp: number;
  rawDamage: number;
  damageType: DamageType;
  bodyParts: BodyPartName[] | "none";
  effectiveSP: number;
  armorDamage: ArmorDamageEntry[];
  penetrating: number;
  ignoredArmor: boolean;
}

const STORAGE_KEY = "damage-history";

function loadState(): DamageHistoryEntry[] {
  if (typeof localStorage === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as DamageHistoryEntry[];
  } catch {
    return [];
  }
}

export const $damageHistory = atom<DamageHistoryEntry[]>(loadState());

// Persist on change
$damageHistory.subscribe((state) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
});

let entryCounter = 0;

export function recordDamage(
  entry: Omit<DamageHistoryEntry, "id" | "timestamp">,
): DamageHistoryEntry {
  const fullEntry: DamageHistoryEntry = {
    ...entry,
    id: `dmg_${Date.now()}_${entryCounter++}`,
    timestamp: Date.now(),
  };

  $damageHistory.set([fullEntry, ...$damageHistory.get()]);
  return fullEntry;
}

export function clearHistory(): void {
  $damageHistory.set([]);
}

export function getHistory(): DamageHistoryEntry[] {
  return $damageHistory.get();
}
