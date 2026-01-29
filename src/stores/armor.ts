import { atom } from "nanostores";
import {
  generateId,
  type ArmorInstance,
  type ArmorPiece,
  type ArmorLayer,
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
        piece !== null &&
        piece.worn &&
        piece.bodyParts.includes(part) &&
        !piece.layer, // implants rendered separately
    );
}

// --- Actions ---

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

export function discardArmor(instanceId: string): void {
  const state = { ...$ownedArmor.get() };
  delete state[instanceId];
  $ownedArmor.set(state);
}

export type WearResult = { success: true } | { success: false; error: string };

function checkLayerConstraints(
  part: BodyPartName,
  newArmorType: "soft" | "hard",
): WearResult {
  const wornLayers = getBodyPartLayers(part);
  const implantLayers = getImplantsForPart(part);
  const totalLayers = wornLayers.length + implantLayers.length;
  const partLabel = part.replace("_", " ");

  if (totalLayers >= 3) {
    return {
      success: false,
      error: `Cannot add more than 3 layers to ${partLabel}`,
    };
  }

  if (newArmorType === "hard") {
    const hasHardWorn = wornLayers.some((l) => l.type === "hard");
    const hasHardImplant = implantLayers.some((l) => l.type === "hard");
    if (hasHardWorn || hasHardImplant) {
      return {
        success: false,
        error: `Only 1 hard armor allowed per ${partLabel}`,
      };
    }
  }

  return { success: true };
}

export function wearArmor(instanceId: string): WearResult {
  const armor = getArmorPiece(instanceId);
  if (!armor || armor.worn) return { success: false, error: "Armor not found" };

  // Check constraints for each body part
  for (const part of armor.bodyParts) {
    const result = checkLayerConstraints(part, armor.type);
    if (!result.success) return result;
  }

  updateInstance(instanceId, { worn: true });
  return { success: true };
}

function removeArmor(instanceId: string): void {
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

// --- Helpers ---

function updateInstance(
  instanceId: string,
  updates: Partial<ArmorInstance>,
): void {
  const state = $ownedArmor.get();
  const current = state[instanceId];
  if (!current) return;

  $ownedArmor.set({
    ...state,
    [instanceId]: { ...current, ...updates },
  });
}

// --- Implant Helpers ---

export function isImplant(templateIdOrPiece: string | ArmorPiece): boolean {
  const template =
    typeof templateIdOrPiece === "string"
      ? getTemplate(templateIdOrPiece)
      : getTemplate(templateIdOrPiece.templateId);
  return template?.layer === "plating" || template?.layer === "subdermal";
}

export function getImplantLayer(templateId: string): ArmorLayer | null {
  const template = getTemplate(templateId);
  return template?.layer ?? null;
}

export function getImplantTemplates(): typeof armorTemplates {
  return Object.fromEntries(
    Object.entries(armorTemplates).filter(
      ([_, t]) => t.layer === "plating" || t.layer === "subdermal",
    ),
  );
}

export function getImplantedArmor(): ArmorPiece[] {
  return getAllOwnedArmor().filter((p) => isImplant(p));
}

export function getInstalledImplants(): ArmorPiece[] {
  return getImplantedArmor().filter((p) => p.worn);
}

export function isImplantInstalled(templateId: string): boolean {
  const state = $ownedArmor.get();
  return Object.values(state).some(
    (inst) => inst.templateId === templateId && inst.worn,
  );
}

export function getImplantsForPart(part: BodyPartName): ArmorPiece[] {
  return getInstalledImplants().filter((p) => p.bodyParts.includes(part));
}

export function installImplant(templateId: string): WearResult {
  const template = getTemplate(templateId);
  if (!template || !isImplant(templateId)) {
    return { success: false, error: "Invalid implant" };
  }

  if (isImplantInstalled(templateId)) {
    return { success: false, error: "Already installed" };
  }

  for (const part of template.bodyParts) {
    const result = checkLayerConstraints(part, template.type);
    if (!result.success) return result;
  }

  // Check if already owned but not installed
  const existing = Object.values($ownedArmor.get()).find(
    (inst) => inst.templateId === templateId,
  );

  if (existing) {
    updateInstance(existing.id, { worn: true });
  } else {
    const instance = acquireArmor(templateId);
    if (instance) {
      updateInstance(instance.id, { worn: true });
    }
  }

  return { success: true };
}

export function uninstallImplant(templateId: string): void {
  const state = $ownedArmor.get();
  const instance = Object.values(state).find(
    (inst) => inst.templateId === templateId && inst.worn,
  );

  if (instance) {
    updateInstance(instance.id, { worn: false });
  }
}

export function repairImplant(instanceId: string): void {
  const instance = $ownedArmor.get()[instanceId];
  if (!instance || !isImplant(instance.templateId)) return;

  const template = getTemplate(instance.templateId);
  if (!template) return;

  const newSpByPart: Partial<Record<BodyPartName, number>> = {};
  for (const part of template.bodyParts) {
    newSpByPart[part] = template.spMax;
  }

  updateInstance(instanceId, { spByPart: newSpByPart });
}

// --- Re-export templates for store UI ---
export { armorTemplates, getTemplate };
