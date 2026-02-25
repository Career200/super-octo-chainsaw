import { atom } from "nanostores";

import type { BodyPartName } from "../scripts/armor/core";
import type { DamageType } from "../scripts/armor/hit";

import { $ownedArmor, setArmorSP } from "./armor";
import { $health, isMortal } from "./health";

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
  headMultiplied?: boolean;
  btm?: number;
  woundDamage?: number;
  diceRolls?: number[];
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

export function undoLatest(): void {
  const entries = $damageHistory.get();
  if (entries.length === 0) return;
  const entry = entries[0];

  if (entry.type === "damage") {
    const woundDamage = entry.woundDamage ?? entry.penetrating;
    if (woundDamage > 0) {
      const cur = $health.get();
      const phys = Math.max(0, cur.physical - woundDamage);
      const stun = Math.max(phys, cur.stun - woundDamage);
      $health.set({
        physical: phys,
        stun,
        stabilized: isMortal(stun) ? cur.stabilized : false,
      });
    }
    if (entry.bodyParts !== "none") {
      const part = entry.bodyParts[0];
      for (const ad of entry.armorDamage) {
        const inst = $ownedArmor.get()[ad.armorId];
        if (!inst) continue;
        const curSP = inst.spByPart[part] ?? 0;
        setArmorSP(ad.armorId, curSP + ad.spLost, [part]);
      }
    }
  } else {
    setArmorSP(entry.armorId, entry.oldSP, entry.bodyParts);
  }

  $damageHistory.set(entries.slice(1));
}

export function clearHistory(): void {
  $damageHistory.set([]);
}
