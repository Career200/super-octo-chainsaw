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
import { ARMOR_CATALOG, IMPLANT_TEMPLATES, getTemplate } from "../scripts/armor/catalog";

// Persistent state: owned armor instances
export type OwnedArmorState = Record<string, ArmorInstance>;

const STORAGE_KEY = "owned-armor";

// Load from localStorage or start empty
function loadState(): OwnedArmorState {
  if (typeof localStorage === "undefined") return {};

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};

  try {
    const state = JSON.parse(stored) as OwnedArmorState;

    // Drop stale instances whose spByPart doesn't match current template
    for (const [id, instance] of Object.entries(state)) {
      const template = getTemplate(instance.templateId);
      if (!template) { delete state[id]; continue; }

      const storedParts = Object.keys(instance.spByPart).sort().join(",");
      const templateParts = [...template.bodyParts].sort().join(",");
      if (storedParts !== templateParts) delete state[id];
    }

    return state;
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
    // Worst per-part ratio scaled to spMax, so face at half-max reads as "full"
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
        !piece.layer, // implants rendered separately
    );
}

// --- Computed Stores ---

/**
 * Current encumbrance (EV) from worn armor and implants
 */
export const $encumbrance = computed($ownedArmor, (): EVResult => {
  const wornArmor = getAllOwnedArmor().filter((a) => a.worn && !a.layer);
  const implants = getInstalledImplants();
  return getTotalEV(wornArmor, implants);
});

// --- Actions ---

// Buy/acquire a new armor piece (spawns instance from template)
export function acquireArmor(templateId: string): ArmorInstance | null {
  const template = getTemplate(templateId);
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
  // Only certain layer types count toward limits
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

  // Check constraints for each body part
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

  const template = getTemplate(instance.templateId);
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
