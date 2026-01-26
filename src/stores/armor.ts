import { atom } from "nanostores";
import {
  generateId,
  type ArmorInstance,
  type ArmorPiece,
  type BodyPartName,
} from "../scripts/armor/core";
import { armorTemplates, getTemplate } from "../scripts/armor/equipment";

// Persistent state: owned armor instances
export type OwnedArmorState = Record<string, ArmorInstance>;

const STORAGE_KEY = "owned-armor";

// Load from localStorage or start empty
function loadState(): OwnedArmorState {
  if (typeof localStorage === "undefined") return {};

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};

  try {
    return JSON.parse(stored) as OwnedArmorState;
  } catch {
    return {};
  }
}

// The persistent store - owned armor instances
export const $ownedArmor = atom<OwnedArmorState>(loadState());

// Persist on change
$ownedArmor.subscribe((state) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
});

// --- Derived Getters ---

// Merge instance with its template to get full ArmorPiece
export function getArmorPiece(instanceId: string): ArmorPiece | null {
  const instance = $ownedArmor.get()[instanceId];
  if (!instance) return null;

  const template = getTemplate(instance.templateId);
  if (!template) return null;

  return {
    ...template,
    id: instance.id,
    spCurrent: instance.spCurrent,
    worn: instance.worn,
  };
}

// Get all owned armor as ArmorPieces
export function getAllOwnedArmor(): ArmorPiece[] {
  return Object.keys($ownedArmor.get())
    .map((id) => getArmorPiece(id))
    .filter((piece): piece is ArmorPiece => piece !== null);
}

// Get worn armor layers for a body part
export function getBodyPartLayers(part: BodyPartName): ArmorPiece[] {
  return getAllOwnedArmor().filter(
    (armor) => armor.worn && armor.bodyParts.includes(part),
  );
}

// --- Actions: Inventory Management ---

// Buy/acquire a new armor piece (spawns instance from template)
export function acquireArmor(templateId: string): ArmorInstance | null {
  const template = getTemplate(templateId);
  if (!template) return null;

  const instance: ArmorInstance = {
    id: generateId(templateId),
    templateId,
    spCurrent: template.spMax,
    worn: false,
  };

  $ownedArmor.set({
    ...$ownedArmor.get(),
    [instance.id]: instance,
  });

  return instance;
}

// Sell/discard an armor piece
export function discardArmor(instanceId: string): void {
  const state = { ...$ownedArmor.get() };

  // Unequip first if worn
  if (state[instanceId]?.worn) {
    state[instanceId] = { ...state[instanceId], worn: false };
  }

  delete state[instanceId];
  $ownedArmor.set(state);
}

// --- Actions: Equip/Unequip ---

export function wearArmor(instanceId: string): boolean {
  const armor = getArmorPiece(instanceId);
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

  updateInstance(instanceId, { worn: true });
  return true;
}

export function removeArmor(instanceId: string): void {
  updateInstance(instanceId, { worn: false });
}

export function toggleArmor(instanceId: string): void {
  const armor = getArmorPiece(instanceId);
  if (!armor) return;

  if (armor.worn) {
    removeArmor(instanceId);
  } else {
    wearArmor(instanceId);
  }
}

// --- Actions: Damage/Repair ---

export function damageArmor(instanceId: string, amount: number = 1): void {
  const instance = $ownedArmor.get()[instanceId];
  if (!instance) return;

  updateInstance(instanceId, {
    spCurrent: Math.max(0, instance.spCurrent - amount),
  });
}

export function repairArmor(instanceId: string, amount?: number): void {
  const instance = $ownedArmor.get()[instanceId];
  if (!instance) return;

  const template = getTemplate(instance.templateId);
  if (!template) return;

  const newSP = amount
    ? Math.min(template.spMax, instance.spCurrent + amount)
    : template.spMax;

  updateInstance(instanceId, { spCurrent: newSP });
}

// --- Actions: Reset ---

export function resetOwnedArmor(): void {
  $ownedArmor.set({});
}

// --- Helper ---

function updateInstance(
  instanceId: string,
  updates: Partial<ArmorInstance>,
): void {
  const current = $ownedArmor.get()[instanceId];
  if (!current) return;

  $ownedArmor.set({
    ...$ownedArmor.get(),
    [instanceId]: { ...current, ...updates },
  });
}

// --- Re-export templates for store UI ---
export { armorTemplates, getTemplate };
