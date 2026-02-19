import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";
import { WEAPON_CATALOG } from "@scripts/weapons/catalog";
import type {
  WeaponTemplate,
  WeaponType,
  Concealability,
  Reliability,
  Availability,
} from "@scripts/weapons/catalog";
import { normalizeKey } from "@scripts/catalog-common";

// --- Types ---

export interface WeaponInstance {
  id: string;
  templateId: string;
  currentAmmo: number;
  currentAmmoType: string;
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
  currentAmmoType: string;
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

// --- Persistence: owned weapon instances ---

export type WeaponsState = Record<string, WeaponInstance>;

function decodeWeapons(raw: string): WeaponsState {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    const result: WeaponsState = {};
    for (const [id, val] of Object.entries(parsed)) {
      if (
        val &&
        typeof val === "object" &&
        !Array.isArray(val) &&
        typeof (val as Record<string, unknown>).id === "string" &&
        typeof (val as Record<string, unknown>).templateId === "string" &&
        typeof (val as Record<string, unknown>).currentAmmo === "number"
      ) {
        result[id] = val as WeaponInstance;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export const $ownedWeapons = persistentAtom<WeaponsState>(
  "character-weapons",
  {},
  {
    encode: JSON.stringify,
    decode: decodeWeapons,
  },
);

// --- Persistence: custom weapon templates ---

export type CustomWeaponsState = Record<string, CustomWeaponDef>;

function decodeCustomWeapons(raw: string): CustomWeaponsState {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    const result: CustomWeaponsState = {};
    for (const [id, val] of Object.entries(parsed)) {
      if (
        val &&
        typeof val === "object" &&
        !Array.isArray(val) &&
        typeof (val as Record<string, unknown>).name === "string" &&
        typeof (val as Record<string, unknown>).type === "string" &&
        typeof (val as Record<string, unknown>).damage === "string"
      ) {
        result[id] = val as CustomWeaponDef;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export const $customWeaponTemplates = persistentAtom<CustomWeaponsState>(
  "character-custom-weapons",
  {},
  {
    encode: JSON.stringify,
    decode: decodeCustomWeapons,
  },
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
    currentAmmoType: "std",
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

export function reloadWeapon(instanceId: string): void {
  const current = $ownedWeapons.get();
  const instance = current[instanceId];
  if (!instance) return;
  const template = resolveWeaponTemplate(instance.templateId);
  if (!template) return;
  $ownedWeapons.set({
    ...current,
    [instanceId]: { ...instance, currentAmmo: template.shots },
  });
}

export function setCurrentAmmo(instanceId: string, ammo: number): void {
  const current = $ownedWeapons.get();
  const instance = current[instanceId];
  if (!instance) return;
  const template = resolveWeaponTemplate(instance.templateId);
  const max = template?.shots ?? ammo;
  $ownedWeapons.set({
    ...current,
    [instanceId]: { ...instance, currentAmmo: Math.max(0, Math.min(max, ammo)) },
  });
}

export function setAmmoType(instanceId: string, type: string): void {
  const current = $ownedWeapons.get();
  const instance = current[instanceId];
  if (!instance) return;
  $ownedWeapons.set({
    ...current,
    [instanceId]: { ...instance, currentAmmoType: type },
  });
}

export function setSmartchipActive(
  instanceId: string,
  active: boolean,
): void {
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
    if (normalizeKey(template.name) === key || template.templateId === key) return false;
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
        currentAmmoType: instance.currentAmmoType,
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
