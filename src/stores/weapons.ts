import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";

import type { LoadedAmmoInfo } from "@scripts/ammo/catalog";
import { normalizeKey } from "@scripts/catalog-common";
import {
  $ammoByCaliberLookup,
  $ownedAmmo,
  addAmmo,
  removeAmmo,
  resolveAmmoTemplate,
} from "@stores/ammo";
import type {
  Availability,
  Concealability,
  Reliability,
  WeaponTemplate,
  WeaponType,
} from "@scripts/weapons/catalog";
import { WEAPON_CATALOG } from "@scripts/weapons/catalog";

import { decodeJson } from "./decode";

// --- Types ---

export interface WeaponInstance {
  id: string;
  templateId: string;
  currentAmmo: number;
  loadedAmmo: LoadedAmmoInfo | null;
  smartchipActive: boolean;
}

/** Custom weapon definition — user-created extension to WEAPON_CATALOG. */
export interface CustomWeaponDef {
  name: string;
  type: WeaponType;
  skill: string;
  wa: number;
  concealability: Concealability;
  availability: Availability;
  damage: string;
  ammo: string;
  shots: number;
  rof: number;
  reliability: Reliability;
  range: number;
  cost: number;
  description: string;
  melee: boolean;
  smartchipped: boolean;
}

/** Merged view for rendering: template + instance state. */
export interface WeaponPiece extends WeaponTemplate {
  id: string;
  currentAmmo: number;
  loadedAmmo: LoadedAmmoInfo | null;
  smartchipActive: boolean;
  custom?: boolean;
}

// --- Helpers ---

function generateId(prefix: string): string {
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${random}`;
}

export function isCustomWeapon(id: string): boolean {
  return !(id in WEAPON_CATALOG);
}

// --- Template resolution ---

export function resolveWeaponTemplate(
  templateId: string,
): WeaponTemplate | null {
  if (templateId in WEAPON_CATALOG) return WEAPON_CATALOG[templateId];
  const custom = $customWeaponTemplates.get()[templateId];
  if (custom) {
    return { templateId, ...custom };
  }
  return null;
}

// --- Persistence ---

export type WeaponsState = Record<string, WeaponInstance>;
export type CustomWeaponsState = Record<string, CustomWeaponDef>;

export const $ownedWeapons = persistentAtom<WeaponsState>(
  "character-weapons",
  {},
  { encode: JSON.stringify, decode: decodeJson<WeaponsState>({}) },
);

export const $customWeaponTemplates = persistentAtom<CustomWeaponsState>(
  "character-custom-weapons",
  {},
  { encode: JSON.stringify, decode: decodeJson<CustomWeaponsState>({}) },
);

// --- Actions: owned weapons ---

export function acquireWeapon(templateId: string): string | null {
  const template = resolveWeaponTemplate(templateId);
  if (!template) return null;
  const id = generateId(templateId.substring(0, 8));
  const instance: WeaponInstance = {
    id,
    templateId,
    currentAmmo: template.shots,
    loadedAmmo: null,
    smartchipActive: false,
  };
  $ownedWeapons.set({ ...$ownedWeapons.get(), [id]: instance });
  return id;
}

export function discardWeapon(instanceId: string): void {
  const current = $ownedWeapons.get();
  if (!(instanceId in current)) return;
  const { [instanceId]: _, ...rest } = current;
  $ownedWeapons.set(rest);
}

export function fireWeapon(instanceId: string, shots: number = 1): void {
  const current = $ownedWeapons.get();
  const instance = current[instanceId];
  if (!instance) return;
  const newAmmo = Math.max(0, instance.currentAmmo - shots);
  $ownedWeapons.set({
    ...current,
    [instanceId]: { ...instance, currentAmmo: newAmmo },
  });
}

export function reloadWeapon(
  instanceId: string,
  ammoTemplateId?: string,
): boolean {
  const current = $ownedWeapons.get();
  const instance = current[instanceId];
  if (!instance) return false;
  const template = resolveWeaponTemplate(instance.templateId);
  if (!template) return false;

  // Determine target ammo type
  const targetAmmoId = ammoTemplateId ?? instance.loadedAmmo?.templateId ?? null;

  // Check if any reserves exist for this weapon's caliber
  const caliberAmmo = template.ammo
    ? ($ammoByCaliberLookup.get()[template.ammo] ?? [])
    : [];
  const hasReserves = caliberAmmo.length > 0;

  // No reserves for caliber → free reload (soft mode: warn but allow)
  if (!hasReserves) {
    $ownedWeapons.set({
      ...current,
      [instanceId]: { ...instance, currentAmmo: template.shots, loadedAmmo: null },
    });
    return true;
  }

  // Reserves exist but no type selected → user must pick via popover
  if (!targetAmmoId) return false;

  // Resolve ammo template
  const ammoTemplate = resolveAmmoTemplate(targetAmmoId);
  if (!ammoTemplate) return false;

  // Type switching: return current magazine rounds to reserves
  const switching =
    instance.loadedAmmo != null &&
    instance.loadedAmmo.templateId !== targetAmmoId;
  if (switching && instance.loadedAmmo && instance.currentAmmo > 0) {
    addAmmo(instance.loadedAmmo.templateId, instance.currentAmmo);
  }

  const currentInMag = switching ? 0 : instance.currentAmmo;
  const roundsNeeded = template.shots - currentInMag;

  // Check available reserves (re-read after potential addAmmo above)
  const reserves = $ownedAmmo.get()[targetAmmoId] ?? 0;
  const roundsToLoad = Math.min(roundsNeeded, reserves);

  if (roundsToLoad > 0) {
    removeAmmo(targetAmmoId, roundsToLoad);
  }

  const loadedAmmo: LoadedAmmoInfo = {
    templateId: targetAmmoId,
    type: ammoTemplate.type,
    damage: ammoTemplate.damage,
    effects: ammoTemplate.effects,
  };

  $ownedWeapons.set({
    ...$ownedWeapons.get(), // re-read in case addAmmo triggered listeners
    [instanceId]: {
      ...instance,
      currentAmmo: currentInMag + roundsToLoad,
      loadedAmmo,
    },
  });
  return true;
}

export function setCurrentAmmo(instanceId: string, ammo: number): void {
  const current = $ownedWeapons.get();
  const instance = current[instanceId];
  if (!instance) return;
  const template = resolveWeaponTemplate(instance.templateId);
  const max = template?.shots ?? ammo;
  $ownedWeapons.set({
    ...current,
    [instanceId]: {
      ...instance,
      currentAmmo: Math.max(0, Math.min(max, ammo)),
    },
  });
}

export function setSmartchipActive(instanceId: string, active: boolean): void {
  const current = $ownedWeapons.get();
  const instance = current[instanceId];
  if (!instance) return;
  $ownedWeapons.set({
    ...current,
    [instanceId]: { ...instance, smartchipActive: active },
  });
}

// --- Actions: custom weapon templates ---

export function addCustomWeapon(
  name: string,
  fields: Omit<CustomWeaponDef, "name">,
): boolean {
  const key = normalizeKey(name);
  for (const template of Object.values(WEAPON_CATALOG)) {
    if (normalizeKey(template.name) === key) return false;
    if (template.templateId === key) return false;
  }
  for (const def of Object.values($customWeaponTemplates.get())) {
    if (normalizeKey(def.name) === key) return false;
  }
  const def: CustomWeaponDef = { name, ...fields };
  $customWeaponTemplates.set({
    ...$customWeaponTemplates.get(),
    [name]: def,
  });
  acquireWeapon(name);
  return true;
}

export function updateCustomWeapon(
  name: string,
  updates: Partial<Omit<CustomWeaponDef, "name">>,
): void {
  const current = $customWeaponTemplates.get();
  if (!(name in current)) return;
  $customWeaponTemplates.set({
    ...current,
    [name]: { ...current[name], ...updates },
  });
}

export function renameCustomWeapon(oldName: string, newName: string): boolean {
  if (!newName.trim() || newName === oldName) return false;
  const defs = $customWeaponTemplates.get();
  if (!(oldName in defs)) return false;
  // Check new name doesn't collide
  const key = normalizeKey(newName);
  for (const template of Object.values(WEAPON_CATALOG)) {
    if (normalizeKey(template.name) === key || template.templateId === key)
      return false;
  }
  for (const def of Object.values(defs)) {
    if (def.name !== oldName && normalizeKey(def.name) === key) return false;
  }
  // Re-key definition
  const { [oldName]: def, ...rest } = defs;
  $customWeaponTemplates.set({ ...rest, [newName]: { ...def, name: newName } });
  // Update owned instances
  const weapons = $ownedWeapons.get();
  const next = { ...weapons };
  for (const [id, inst] of Object.entries(next)) {
    if (inst.templateId === oldName) {
      next[id] = { ...inst, templateId: newName };
    }
  }
  $ownedWeapons.set(next);
  return true;
}

export function removeCustomWeapon(name: string): void {
  const currentDefs = $customWeaponTemplates.get();
  if (!(name in currentDefs)) return;
  const { [name]: _, ...restDefs } = currentDefs;
  $customWeaponTemplates.set(restDefs);
  // Also remove all instances of this weapon
  const currentWeapons = $ownedWeapons.get();
  const remaining: WeaponsState = {};
  for (const [id, instance] of Object.entries(currentWeapons)) {
    if (instance.templateId !== name) {
      remaining[id] = instance;
    }
  }
  $ownedWeapons.set(remaining);
}

// --- Computed ---

/** All owned weapons: instances hydrated with template data. */
export const $allOwnedWeapons = computed(
  [$ownedWeapons, $customWeaponTemplates],
  (instances, _customDefs): WeaponPiece[] => {
    const weapons: WeaponPiece[] = [];
    for (const instance of Object.values(instances)) {
      const template = resolveWeaponTemplate(instance.templateId);
      if (!template) continue;
      weapons.push({
        ...template,
        id: instance.id,
        currentAmmo: instance.currentAmmo,
        loadedAmmo: instance.loadedAmmo ?? null,
        smartchipActive: instance.smartchipActive,
        custom: isCustomWeapon(instance.templateId) || undefined,
      });
    }
    return weapons;
  },
);

/** All custom weapon templates as full WeaponTemplate objects. */
export const $customWeaponList = computed(
  $customWeaponTemplates,
  (customDefs): WeaponTemplate[] => {
    return Object.entries(customDefs).map(([id, def]) => ({
      templateId: id,
      ...def,
    }));
  },
);
