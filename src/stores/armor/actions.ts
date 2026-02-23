import type { ArmorInstance, ArmorLayer, ArmorPiece, BodyPartName } from "@scripts/armor/core";
import { countsAsLayer, generateId, getPartSpMax } from "@scripts/armor/core";
import { type Availability, normalizeKey } from "@scripts/catalog-common";

import type { CustomArmorDef } from "./state";
import {
  $customArmorTemplates,
  $ownedArmor,
  ARMOR_CATALOG,
  getBodyPartLayers,
  getImplantsForPart,
  isImplant,
  resolveTemplate,
  updateInstance,
} from "./state";

// --- Wear result ---

export type WearResult = { success: true } | { success: false; error: string };

// --- Layer Constraints (pure — takes layers as params) ---

export function checkLayerConstraints(
  part: BodyPartName,
  newArmorType: "soft" | "hard",
  newArmorLayer: ArmorLayer | undefined,
  wornLayers: ArmorPiece[],
  implantLayers: ArmorPiece[],
): WearResult {
  if (!countsAsLayer(newArmorLayer)) {
    return { success: true };
  }

  const countedImplants = implantLayers.filter((l) => countsAsLayer(l.layer));
  const totalLayers = wornLayers.length + countedImplants.length;
  const partLabel = part.replace("_", " ");

  if (totalLayers >= 3) {
    return {
      success: false,
      error: `Cannot add more than 3 layers to ${partLabel}`,
    };
  }

  if (newArmorType === "hard") {
    const hasHardWorn = wornLayers.some((l) => l.type === "hard");
    const hasHardImplant = countedImplants.some((l) => l.type === "hard");
    if (hasHardWorn || hasHardImplant) {
      return {
        success: false,
        error: `Only 1 hard armor allowed per ${partLabel}`,
      };
    }
  }

  return { success: true };
}

// --- Standard Armor Actions ---

export function acquireArmor(templateId: string): ArmorInstance | null {
  const template = resolveTemplate(templateId);
  if (!template) return null;

  const spByPart: Partial<Record<BodyPartName, number>> = {};
  for (const part of template.bodyParts) {
    spByPart[part] = getPartSpMax(template, part);
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

export function wearArmor(instanceId: string): WearResult {
  const state = $ownedArmor.get();
  const instance = state[instanceId];
  if (!instance || instance.worn)
    return { success: false, error: "Armor not found" };

  const template = resolveTemplate(instance.templateId);
  if (!template) return { success: false, error: "Template not found" };

  for (const part of template.bodyParts) {
    const result = checkLayerConstraints(
      part,
      template.type,
      "worn",
      getBodyPartLayers(part),
      getImplantsForPart(part),
    );
    if (!result.success) return result;
  }

  updateInstance(instanceId, { worn: true });
  return { success: true };
}

function removeArmor(instanceId: string): void {
  updateInstance(instanceId, { worn: false });
}

export function unwearAll(): void {
  const state = $ownedArmor.get();
  const next = { ...state };
  let changed = false;
  for (const [id, inst] of Object.entries(next)) {
    if (inst.worn && !isImplant(inst.templateId)) {
      next[id] = { ...inst, worn: false };
      changed = true;
    }
  }
  if (changed) $ownedArmor.set(next);
}

export function toggleArmor(instanceId: string): WearResult {
  const instance = $ownedArmor.get()[instanceId];
  if (!instance) return { success: false, error: "Armor not found" };

  if (instance.worn) {
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

  const template = resolveTemplate(instance.templateId);
  if (!template) return;

  const newSpByPart = { ...instance.spByPart };

  const partsToUpdate = parts ?? template.bodyParts;
  for (const part of partsToUpdate) {
    if (template.bodyParts.includes(part)) {
      const max = getPartSpMax(template, part);
      newSpByPart[part] = Math.max(0, Math.min(max, sp));
    }
  }

  updateInstance(instanceId, { spByPart: newSpByPart });
}

// --- Custom Armor Actions ---

export function addCustomArmor(
  name: string,
  fields: {
    type: "soft" | "hard";
    spMax: number;
    bodyParts: BodyPartName[];
    ev: number;
    cost: number;
    description: string;
    availability: Availability;
  },
): string | null {
  const key = normalizeKey(name);
  // Check against catalog template names
  for (const template of Object.values(ARMOR_CATALOG)) {
    if (normalizeKey(template.name) === key) return null;
    if (template.templateId === key) return null;
  }
  // Check against existing custom armor names
  for (const def of Object.values($customArmorTemplates.get())) {
    if (normalizeKey(def.name) === key) return null;
  }
  const def: CustomArmorDef = { name, ...fields };
  $customArmorTemplates.set({ ...$customArmorTemplates.get(), [name]: def });
  // Also acquire an instance
  const instance = acquireArmor(name);
  return instance?.id ?? null;
}

export function updateCustomArmor(
  name: string,
  updates: Partial<Omit<CustomArmorDef, "name">>,
): number {
  const current = $customArmorTemplates.get();
  if (!(name in current)) return 0;

  $customArmorTemplates.set({
    ...current,
    [name]: { ...current[name], ...updates },
  });

  const state = $ownedArmor.get();
  const next = { ...state };
  let removed = 0;
  for (const [id, inst] of Object.entries(next)) {
    if (inst.templateId === name) {
      delete next[id];
      removed++;
    }
  }
  if (removed) $ownedArmor.set(next);
  return removed;
}

export function renameCustomArmor(oldName: string, newName: string): boolean {
  if (!newName.trim() || newName === oldName) return false;
  const defs = $customArmorTemplates.get();
  if (!(oldName in defs)) return false;
  const key = normalizeKey(newName);
  for (const template of Object.values(ARMOR_CATALOG)) {
    if (normalizeKey(template.name) === key || template.templateId === key)
      return false;
  }
  for (const def of Object.values(defs)) {
    if (def.name !== oldName && normalizeKey(def.name) === key) return false;
  }
  const { [oldName]: def, ...rest } = defs;
  $customArmorTemplates.set({ ...rest, [newName]: { ...def, name: newName } });
  // Update owned instances
  const state = $ownedArmor.get();
  const next = { ...state };
  for (const [id, inst] of Object.entries(next)) {
    if (inst.templateId === oldName) {
      next[id] = { ...inst, templateId: newName };
    }
  }
  $ownedArmor.set(next);
  return true;
}

export function removeCustomArmor(name: string): void {
  const currentDefs = $customArmorTemplates.get();
  if (!(name in currentDefs)) return;
  const { [name]: _, ...restDefs } = currentDefs;
  $customArmorTemplates.set(restDefs);
  // Also remove all owned instances with this templateId
  const state = $ownedArmor.get();
  const next = { ...state };
  let changed = false;
  for (const [id, inst] of Object.entries(next)) {
    if (inst.templateId === name) {
      delete next[id];
      changed = true;
    }
  }
  if (changed) $ownedArmor.set(next);
}
