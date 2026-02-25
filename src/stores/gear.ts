import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";

import { normalizeKey } from "@scripts/catalog-common";
import type { Availability, GearTemplate } from "@scripts/gear/catalog";
import { GEAR_CATALOG } from "@scripts/gear/catalog";

// --- Money ---

export const $eurodollars = persistentAtom<number>("character-eb", 0, {
  encode: String,
  decode: (raw) => Math.max(0, parseInt(raw, 10) || 0),
});

export function setEurodollars(value: number): void {
  $eurodollars.set(Math.max(0, value));
}

// --- Types ---

/** Custom gear definition — user-created extension to GEAR_CATALOG. */
export interface CustomGearDef {
  name: string;
  description: string;
  type: string;
  cost?: number;
  availability?: Availability;
}

// --- Helpers ---

export function isCustomGear(id: string): boolean {
  return !(id in GEAR_CATALOG);
}

// --- Persistence: quantities ---

/**
 * Sparse persistence: templateId/customName → quantity for all owned gear.
 * Catalog data comes from GEAR_CATALOG; custom definitions from $customGearItems.
 */
export type GearState = Record<string, number>;

function decodeGear(raw: string): GearState {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    const result: GearState = {};
    for (const [id, qty] of Object.entries(parsed)) {
      if (typeof qty === "number" && qty > 0) {
        result[id] = qty;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export const $gear = persistentAtom<GearState>(
  "character-gear",
  {},
  {
    encode: JSON.stringify,
    decode: decodeGear,
  },
);

// --- Persistence: custom gear definitions ---

export type CustomGearState = Record<string, CustomGearDef>;

function decodeCustomGear(raw: string): CustomGearState {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    const result: CustomGearState = {};
    for (const [id, val] of Object.entries(parsed)) {
      if (
        val &&
        typeof val === "object" &&
        !Array.isArray(val) &&
        typeof (val as Record<string, unknown>).name === "string" &&
        typeof (val as Record<string, unknown>).description === "string" &&
        typeof (val as Record<string, unknown>).type === "string"
      ) {
        result[id] = val as CustomGearDef;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export const $customGearItems = persistentAtom<CustomGearState>(
  "character-custom-gear",
  {},
  {
    encode: JSON.stringify,
    decode: decodeCustomGear,
  },
);

// --- Actions ---

export function addGear(id: string): void {
  if (!GEAR_CATALOG[id] && !$customGearItems.get()[id]) return;
  const current = $gear.get();
  $gear.set({ ...current, [id]: (current[id] ?? 0) + 1 });
}

export function removeGear(id: string): void {
  const current = $gear.get();
  const qty = current[id];
  if (!qty) return;
  if (qty <= 1) {
    const { [id]: _, ...rest } = current;
    $gear.set(rest);
  } else {
    $gear.set({ ...current, [id]: qty - 1 });
  }
}

export function addCustomGear(
  name: string,
  fields: {
    description: string;
    type: string;
    cost?: number;
    availability: Availability;
  },
): boolean {
  const key = normalizeKey(name);
  // Check against catalog template names
  for (const template of Object.values(GEAR_CATALOG)) {
    if (normalizeKey(template.name) === key) return false;
    if (template.templateId === key) return false;
  }
  // Check against existing custom gear names
  for (const def of Object.values($customGearItems.get())) {
    if (normalizeKey(def.name) === key) return false;
  }
  const def: CustomGearDef = { name, ...fields };
  $customGearItems.set({ ...$customGearItems.get(), [name]: def });
  // Also add 1 to quantities
  addGear(name);
  return true;
}

export function updateCustomGear(
  name: string,
  updates: Partial<
    Pick<CustomGearDef, "description" | "type" | "cost" | "availability">
  >,
): void {
  const current = $customGearItems.get();
  if (!(name in current)) return;
  $customGearItems.set({
    ...current,
    [name]: { ...current[name], ...updates },
  });
}

export function renameCustomGear(oldName: string, newName: string): boolean {
  if (!newName.trim() || newName === oldName) return false;
  const defs = $customGearItems.get();
  if (!(oldName in defs)) return false;
  const key = normalizeKey(newName);
  for (const template of Object.values(GEAR_CATALOG)) {
    if (normalizeKey(template.name) === key || template.templateId === key)
      return false;
  }
  for (const def of Object.values(defs)) {
    if (def.name !== oldName && normalizeKey(def.name) === key) return false;
  }
  // Re-key definition
  const { [oldName]: def, ...rest } = defs;
  $customGearItems.set({ ...rest, [newName]: { ...def, name: newName } });
  // Re-key quantity
  const quantities = $gear.get();
  if (oldName in quantities) {
    const { [oldName]: qty, ...restQty } = quantities;
    $gear.set({ ...restQty, [newName]: qty });
  }
  return true;
}

export function removeCustomGear(name: string): void {
  const currentDefs = $customGearItems.get();
  if (!(name in currentDefs)) return;
  const { [name]: _, ...restDefs } = currentDefs;
  $customGearItems.set(restDefs);
  // Also remove from quantities
  const currentQty = $gear.get();
  if (name in currentQty) {
    const { [name]: __, ...restQty } = currentQty;
    $gear.set(restQty);
  }
}

// --- Computed ---

export interface OwnedGearItem extends GearTemplate {
  quantity: number;
  custom?: boolean;
}

/** All owned gear: catalog items hydrated + custom items with qty > 0. */
export const $ownedGear = computed(
  [$gear, $customGearItems],
  (quantities, customDefs): OwnedGearItem[] => {
    const items: OwnedGearItem[] = [];
    for (const [id, qty] of Object.entries(quantities)) {
      if (qty <= 0) continue;
      const catalogTemplate = GEAR_CATALOG[id];
      if (catalogTemplate) {
        items.push({ ...catalogTemplate, quantity: qty });
      } else {
        const customDef = customDefs[id];
        if (customDef) {
          items.push({
            templateId: id,
            name: customDef.name,
            description: customDef.description,
            type: customDef.type,
            cost: customDef.cost,
            availability: customDef.availability,
            quantity: qty,
            custom: true,
          });
        }
      }
    }
    return items;
  },
);

export const $ownedGearCount = computed($ownedGear, (items) =>
  items.reduce((sum, i) => sum + i.quantity, 0),
);

/** All custom gear definitions, with current quantities. */
export const $customGear = computed(
  [$gear, $customGearItems],
  (quantities, customDefs): OwnedGearItem[] => {
    const items: OwnedGearItem[] = [];
    for (const [id, def] of Object.entries(customDefs)) {
      items.push({
        templateId: id,
        name: def.name,
        description: def.description,
        type: def.type,
        cost: def.cost,
        availability: def.availability,
        quantity: quantities[id] ?? 0,
        custom: true,
      });
    }
    return items;
  },
);
