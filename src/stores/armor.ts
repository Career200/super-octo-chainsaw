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
export function getArmorPiece(
  instanceId: string,
  part?: BodyPartName,
): ArmorPiece | null {
  const instance = $ownedArmor.get()[instanceId];
  if (!instance) return null;

  const template = getTemplate(instance.templateId);
  if (!template) return null;

  let spCurrent: number;
  if (part && instance.spByPart[part] !== undefined) {
    spCurrent = instance.spByPart[part]!;
  } else {
    const values = Object.values(instance.spByPart).filter(
      (v): v is number => v !== undefined,
    );
    spCurrent = values.length > 0 ? Math.min(...values) : 0;
  }

  return {
    ...template,
    id: instance.id,
    spByPart: instance.spByPart,
    spCurrent,
    worn: instance.worn,
  };
}

export function getAllOwnedArmor(): ArmorPiece[] {
  return Object.keys($ownedArmor.get())
    .map((id) => getArmorPiece(id))
    .filter((piece): piece is ArmorPiece => piece !== null);
}

export function getBodyPartLayers(part: BodyPartName): ArmorPiece[] {
  return Object.keys($ownedArmor.get())
    .map((id) => getArmorPiece(id, part))
    .filter(
      (piece): piece is ArmorPiece =>
        piece !== null && piece.worn && piece.bodyParts.includes(part),
    );
}

// --- Actions: Inventory Management ---

// Buy/acquire a new armor piece (spawns instance from template)
export function acquireArmor(templateId: string): ArmorInstance | null {
  const template = getTemplate(templateId);
  if (!template) return null;

  const spByPart: Partial<Record<BodyPartName, number>> = {};
  for (const part of template.bodyParts) {
    spByPart[part] = template.spMax;
  }

  const instance: ArmorInstance = {
    id: generateId(templateId),
    templateId,
    spByPart,
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
  delete state[instanceId];
  $ownedArmor.set(state);
}

// --- Actions: Equip/Unequip ---

export type WearResult = { success: true } | { success: false; error: string };

export function wearArmor(instanceId: string): WearResult {
  const armor = getArmorPiece(instanceId);
  if (!armor || armor.worn) return { success: false, error: "Armor not found" };

  // Check constraints for each body part
  for (const part of armor.bodyParts) {
    const layers = getBodyPartLayers(part);
    const partLabel = part.replace("_", " ");

    if (layers.length >= 3) {
      return {
        success: false,
        error: `Cannot add more than 3 layers to ${partLabel}`,
      };
    }

    if (armor.type === "hard" && layers.some((l) => l.type === "hard")) {
      return {
        success: false,
        error: `Only 1 hard armor allowed per ${partLabel}`,
      };
    }
  }

  updateInstance(instanceId, { worn: true });
  return { success: true };
}

export function removeArmor(instanceId: string): void {
  updateInstance(instanceId, { worn: false });
}

export function toggleArmor(instanceId: string): WearResult {
  const armor = getArmorPiece(instanceId);
  if (!armor) return { success: false, error: "Armor not found" };

  if (armor.worn) {
    removeArmor(instanceId);
    return { success: true };
  } else {
    return wearArmor(instanceId);
  }
}

// --- Actions: Damage/Repair ---

export function damageArmor(
  instanceId: string,
  part: BodyPartName,
  amount: number = 1,
): void {
  const instance = $ownedArmor.get()[instanceId];
  if (!instance) return;

  const currentSP = instance.spByPart[part];
  if (currentSP === undefined) return;

  const newSpByPart = {
    ...instance.spByPart,
    [part]: Math.max(0, currentSP - amount),
  };

  updateInstance(instanceId, { spByPart: newSpByPart });
}

export function repairArmor(
  instanceId: string,
  part?: BodyPartName,
  amount?: number,
): void {
  const instance = $ownedArmor.get()[instanceId];
  if (!instance) return;

  const template = getTemplate(instance.templateId);
  if (!template) return;

  const newSpByPart = { ...instance.spByPart };
  const partsToRepair = part ? [part] : template.bodyParts;

  for (const p of partsToRepair) {
    const currentSP = instance.spByPart[p] ?? 0;
    newSpByPart[p] = amount
      ? Math.min(template.spMax, currentSP + amount)
      : template.spMax;
  }

  updateInstance(instanceId, { spByPart: newSpByPart });
}

export function setArmorSP(
  instanceId: string,
  sp: number,
  parts?: BodyPartName[],
): void {
  const instance = $ownedArmor.get()[instanceId];
  if (!instance) return;

  const template = getTemplate(instance.templateId);
  if (!template) return;

  const clampedSP = Math.max(0, Math.min(template.spMax, sp));
  const newSpByPart = { ...instance.spByPart };

  const partsToUpdate = parts ?? template.bodyParts;
  for (const part of partsToUpdate) {
    if (template.bodyParts.includes(part)) {
      newSpByPart[part] = clampedSP;
    }
  }

  updateInstance(instanceId, { spByPart: newSpByPart });
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
