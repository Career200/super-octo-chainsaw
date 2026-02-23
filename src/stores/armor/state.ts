import { atom, computed } from "nanostores";

import {
  ARMOR_CATALOG,
  getTemplate,
  IMPLANT_TEMPLATES,
} from "@scripts/armor/catalog";
import {
  type ArmorInstance,
  type ArmorLayer,
  type ArmorPiece,
  type ArmorTemplate,
  type BodyPartName,
  type EVResult,
  getPartSpMax,
  getTotalEV,
} from "@scripts/armor/core";
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

export function toArmorTemplate(
  id: string,
  def: CustomArmorDef,
): ArmorTemplate {
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

// --- Implant query functions (kept here to avoid circular deps) ---

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

export function getImplantedArmor(): ArmorPiece[] {
  return getAllOwnedArmor().filter((p) => isImplant(p));
}

export function getInstalledImplants(): ArmorPiece[] {
  return getImplantedArmor().filter((p) => p.worn);
}

export function getImplantsForPart(part: BodyPartName): ArmorPiece[] {
  return getInstalledImplants().filter((p) => p.bodyParts.includes(part));
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

// --- Internal Helpers ---

export function updateInstance(
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

// --- Re-export catalog for UI ---
export { ARMOR_CATALOG, getTemplate, IMPLANT_TEMPLATES };
export type { ArmorInstance, ArmorLayer, ArmorPiece, ArmorTemplate, BodyPartName };
