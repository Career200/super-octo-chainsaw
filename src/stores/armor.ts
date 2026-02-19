import { atom, computed } from "nanostores";
import {
  generateId,
  getPartSpMax,
  getTotalEV,
  countsAsLayer,
  type ArmorInstance,
  type ArmorPiece,
  type ArmorTemplate,
  type ArmorLayer,
  type BodyPartName,
  type EVResult,
} from "../scripts/armor/core";
import {
  ARMOR_CATALOG,
  IMPLANT_TEMPLATES,
  getTemplate,
} from "../scripts/armor/catalog";
import { normalizeKey } from "@scripts/catalog-common";
import type { Availability } from "@scripts/catalog-common";

// --- Custom Armor Definitions ---

export interface CustomArmorDef {
  name: string;
  type: "soft" | "hard";
  spMax: number;
  bodyParts: BodyPartName[];
  ev: number;
  cost: number;
  description: string;
  availability: Availability;
}

export type CustomArmorState = Record<string, CustomArmorDef>;

const CUSTOM_ARMOR_KEY = "character-custom-armor";

function loadCustomArmor(): CustomArmorState {
  if (typeof localStorage === "undefined") return {};
  const stored = localStorage.getItem(CUSTOM_ARMOR_KEY);
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    const result: CustomArmorState = {};
    for (const [id, val] of Object.entries(parsed)) {
      if (
        val &&
        typeof val === "object" &&
        !Array.isArray(val) &&
        typeof (val as Record<string, unknown>).name === "string" &&
        typeof (val as Record<string, unknown>).type === "string" &&
        typeof (val as Record<string, unknown>).spMax === "number" &&
        Array.isArray((val as Record<string, unknown>).bodyParts)
      ) {
        result[id] = val as CustomArmorDef;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export const $customArmorTemplates = atom<CustomArmorState>(loadCustomArmor());

$customArmorTemplates.subscribe((state) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(CUSTOM_ARMOR_KEY, JSON.stringify(state));
  }
});

// --- Template Resolution ---

function toArmorTemplate(id: string, def: CustomArmorDef): ArmorTemplate {
  return {
    templateId: id,
    name: def.name,
    type: def.type,
    spMax: def.spMax,
    bodyParts: def.bodyParts,
    ev: def.ev,
    cost: def.cost,
    description: def.description,
    availability: def.availability,
  };
}

/** Resolve a template from catalog, implants, or custom definitions. */
export function resolveTemplate(templateId: string): ArmorTemplate | null {
  const catalogTemplate = getTemplate(templateId);
  if (catalogTemplate) return catalogTemplate;
  const custom = $customArmorTemplates.get()[templateId];
  if (!custom) return null;
  return toArmorTemplate(templateId, custom);
}

// --- Custom Armor Helpers ---

export function isCustomArmor(id: string): boolean {
  return !(id in ARMOR_CATALOG) && !(id in IMPLANT_TEMPLATES);
}

// --- Persistent state: owned armor instances ---

export type OwnedArmorState = Record<string, ArmorInstance>;

const STORAGE_KEY = "owned-armor";

function loadState(): OwnedArmorState {
  if (typeof localStorage === "undefined") return {};

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};

  try {
    const state = JSON.parse(stored) as OwnedArmorState;

    // Drop stale instances whose spByPart doesn't match current template
    for (const [id, instance] of Object.entries(state)) {
      const template = resolveTemplate(instance.templateId);
      if (!template) {
        delete state[id];
        continue;
      }

      const storedParts = Object.keys(instance.spByPart).sort().join(",");
      const templateParts = [...template.bodyParts].sort().join(",");
      if (storedParts !== templateParts) delete state[id];
    }

    return state;
  } catch {
    return {};
  }
}

export const $ownedArmor = atom<OwnedArmorState>(loadState());

$ownedArmor.subscribe((state) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
});

// --- Derived Getters ---

export function getArmorPiece(
  instanceId: string,
  part?: BodyPartName,
): ArmorPiece | null {
  const instance = $ownedArmor.get()[instanceId];
  if (!instance) return null;

  const template = resolveTemplate(instance.templateId);
  if (!template) return null;

  let spCurrent: number;
  if (part && instance.spByPart[part] !== undefined) {
    spCurrent = instance.spByPart[part]!;
  } else {
    let worstRatio = 1;
    for (const p of template.bodyParts) {
      const sp = instance.spByPart[p] ?? 0;
      const max = getPartSpMax(template, p);
      if (max > 0) worstRatio = Math.min(worstRatio, sp / max);
    }
    spCurrent = Math.round(worstRatio * template.spMax);
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
        !piece.layer,
    );
}

// --- Computed Stores ---

export const $encumbrance = computed($ownedArmor, (): EVResult => {
  const wornArmor = getAllOwnedArmor().filter((a) => a.worn && !a.layer);
  const implants = getInstalledImplants();
  return getTotalEV(wornArmor, implants);
});

export const $customArmorList = computed(
  $customArmorTemplates,
  (defs): ArmorTemplate[] =>
    Object.entries(defs).map(([id, def]) => toArmorTemplate(id, def)),
);

// --- Actions ---

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

export type WearResult = { success: true } | { success: false; error: string };

function checkLayerConstraints(
  part: BodyPartName,
  newArmorType: "soft" | "hard",
  newArmorLayer?: ArmorLayer,
): WearResult {
  if (!countsAsLayer(newArmorLayer)) {
    return { success: true };
  }

  const wornLayers = getBodyPartLayers(part);
  const implantLayers = getImplantsForPart(part);
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

export function wearArmor(instanceId: string): WearResult {
  const armor = getArmorPiece(instanceId);
  if (!armor || armor.worn) return { success: false, error: "Armor not found" };

  for (const part of armor.bodyParts) {
    const result = checkLayerConstraints(part, armor.type, "worn");
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
  return (
    template?.layer === "plating" ||
    template?.layer === "skinweave" ||
    template?.layer === "subdermal" ||
    template?.layer === "faceplate"
  );
}

export function isSkinweave(templateIdOrPiece: string | ArmorPiece): boolean {
  const template =
    typeof templateIdOrPiece === "string"
      ? getTemplate(templateIdOrPiece)
      : getTemplate(templateIdOrPiece.templateId);
  return template?.layer === "skinweave";
}

export function getImplantLayer(templateId: string): ArmorLayer | null {
  const template = getTemplate(templateId);
  return template?.layer ?? null;
}

export function getImplantTemplates(): Record<string, ArmorTemplate> {
  return IMPLANT_TEMPLATES;
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
    const result = checkLayerConstraints(part, template.type, template.layer);
    if (!result.success) return result;
  }

  const instance = acquireArmor(templateId);
  if (instance) {
    updateInstance(instance.id, { worn: true });
  }

  return { success: true };
}

export function uninstallImplant(templateId: string): void {
  const state = $ownedArmor.get();
  const instance = Object.values(state).find(
    (inst) => inst.templateId === templateId && inst.worn,
  );

  if (instance) {
    discardArmor(instance.id);
  }
}

export function repairImplant(instanceId: string): void {
  const instance = $ownedArmor.get()[instanceId];
  if (!instance || !isImplant(instance.templateId)) return;

  const template = getTemplate(instance.templateId);
  if (!template) return;

  const newSpByPart: Partial<Record<BodyPartName, number>> = {};
  for (const part of template.bodyParts) {
    newSpByPart[part] = getPartSpMax(template, part);
  }

  updateInstance(instanceId, { spByPart: newSpByPart });
}

// --- Skinweave Helpers ---

export function getInstalledSkinweave(): ArmorPiece | null {
  const installed = getInstalledImplants().find((p) => isSkinweave(p));
  return installed ?? null;
}

export function getSkinweaveLevel(): number {
  const skinweave = getInstalledSkinweave();
  return skinweave?.spMax ?? 0;
}

export function installSkinweave(templateId: string): WearResult {
  const template = getTemplate(templateId);
  if (!template || !isSkinweave(templateId)) {
    return { success: false, error: "Invalid skinweave" };
  }

  const existing = getInstalledSkinweave();
  if (existing) {
    uninstallImplant(existing.templateId);
  }

  const instance = acquireArmor(templateId);
  if (instance) {
    updateInstance(instance.id, { worn: true });
  }

  return { success: true };
}

export function uninstallSkinweave(): void {
  const skinweave = getInstalledSkinweave();
  if (skinweave) {
    uninstallImplant(skinweave.templateId);
  }
}

// --- Re-export catalog for UI ---
export { ARMOR_CATALOG, IMPLANT_TEMPLATES, getTemplate };
