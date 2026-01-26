import { persistentMap } from "@nanostores/persistent";
import type { ArmorPiece, BodyPartName } from "../scripts/armor/core";
import { armorDefaults } from "../scripts/armor/equipment";

// Persistent state: just the mutable parts (spCurrent, worn)
export interface ArmorItemState {
  spCurrent: number;
  worn: boolean;
}

export type ArmorInventoryState = Record<string, ArmorItemState>;

// Initialize from defaults
function getInitialState(): ArmorInventoryState {
  const state: ArmorInventoryState = {};
  for (const [id, armor] of Object.entries(armorDefaults)) {
    state[id] = { spCurrent: armor.spTotal, worn: false };
  }
  return state;
}

// The persistent store - survives page navigation and refresh
export const $armorInventory = persistentMap<ArmorInventoryState>(
  "armor:",
  getInitialState(),
);

// Derived: get full armor piece with current state
export function getArmorPiece(id: string): ArmorPiece | null {
  const base = armorDefaults[id];
  if (!base) return null;

  const state = $armorInventory.get()[id] ?? {
    spCurrent: base.spTotal,
    worn: false,
  };

  return {
    ...base,
    spCurrent: state.spCurrent,
    worn: state.worn,
  };
}

// Derived: get all armor pieces with current state
export function getAllArmor(): ArmorPiece[] {
  return Object.keys(armorDefaults).map((id) => getArmorPiece(id)!);
}

// Derived: get layers for a body part
export function getBodyPartLayers(part: BodyPartName): ArmorPiece[] {
  return getAllArmor().filter(
    (armor) => armor.worn && armor.bodyParts.includes(part),
  );
}

// Actions
export function wearArmor(id: string): boolean {
  const armor = getArmorPiece(id);
  if (!armor || armor.worn) return false;

  // Check constraints for each body part
  for (const part of armor.bodyParts) {
    const layers = getBodyPartLayers(part);

    if (layers.length >= 3) {
      console.warn(`Cannot add more than 3 layers to ${part}`);
      return false;
    }

    if (armor.type === "hard" && layers.some((l) => l.type === "hard")) {
      console.warn(`Only 1 hard armor allowed per ${part}`);
      return false;
    }
  }

  $armorInventory.setKey(id, {
    ...$armorInventory.get()[id],
    worn: true,
  });
  return true;
}

export function removeArmor(id: string): void {
  const current = $armorInventory.get()[id];
  if (!current) return;

  $armorInventory.setKey(id, {
    ...current,
    worn: false,
  });
}

export function toggleArmor(id: string): void {
  const armor = getArmorPiece(id);
  if (!armor) return;

  if (armor.worn) {
    removeArmor(id);
  } else {
    wearArmor(id);
  }
}

// Damage system
export function damageArmor(id: string, amount: number = 1): void {
  const current = $armorInventory.get()[id];
  if (!current) return;

  $armorInventory.setKey(id, {
    ...current,
    spCurrent: Math.max(0, current.spCurrent - amount),
  });
}

export function repairArmor(id: string, amount?: number): void {
  const base = armorDefaults[id];
  const current = $armorInventory.get()[id];
  if (!base || !current) return;

  const newSP = amount
    ? Math.min(base.spTotal, current.spCurrent + amount)
    : base.spTotal;

  $armorInventory.setKey(id, {
    ...current,
    spCurrent: newSP,
  });
}

// Reset all armor to defaults
export function resetArmor(): void {
  const initial = getInitialState();
  for (const [id, state] of Object.entries(initial)) {
    $armorInventory.setKey(id, state);
  }
}
