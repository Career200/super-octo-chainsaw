import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";

import type {
  AmmoTemplate,
  Availability,
  CustomAmmoDef,
} from "@scripts/ammo/catalog";
import { AMMO_CATALOG } from "@scripts/ammo/catalog";
import { normalizeKey } from "@scripts/catalog-common";

import { decodeJson } from "./decode";

// --- Types ---

export interface OwnedAmmoItem extends AmmoTemplate {
  quantity: number;
  custom?: boolean;
}

// --- Persistence ---

export type AmmoState = Record<string, number>;
export type CustomAmmoState = Record<string, CustomAmmoDef>;

export const $ownedAmmo = persistentAtom<AmmoState>(
  "character-ammo",
  {},
  { encode: JSON.stringify, decode: decodeJson<AmmoState>({}) },
);

export const $customAmmoItems = persistentAtom<CustomAmmoState>(
  "character-custom-ammo",
  {},
  { encode: JSON.stringify, decode: decodeJson<CustomAmmoState>({}) },
);

// --- Helpers ---

export function resolveAmmoTemplate(templateId: string): AmmoTemplate | null {
  if (templateId in AMMO_CATALOG) return AMMO_CATALOG[templateId];
  const custom = $customAmmoItems.get()[templateId];
  if (custom) {
    return {
      templateId,
      caliber: custom.caliber,
      type: custom.type,
      damage: custom.damage,
      effects: custom.effects,
      description: custom.description,
      cost: custom.cost ?? 0,
      availability: custom.availability ?? "C",
    };
  }
  return null;
}

// --- Actions ---

export function addAmmo(templateId: string, qty: number = 100): void {
  if (!resolveAmmoTemplate(templateId)) return;
  const current = $ownedAmmo.get();
  $ownedAmmo.set({
    ...current,
    [templateId]: (current[templateId] ?? 0) + qty,
  });
}

export function removeAmmo(templateId: string, qty: number = 1): void {
  const current = $ownedAmmo.get();
  const owned = current[templateId];
  if (!owned) return;
  if (owned <= qty) {
    const { [templateId]: _, ...rest } = current;
    $ownedAmmo.set(rest);
  } else {
    $ownedAmmo.set({ ...current, [templateId]: owned - qty });
  }
}

export function addCustomAmmo(
  caliber: string,
  type: string,
  fields: {
    damage: string;
    effects: string;
    description: string;
    cost?: number;
    availability?: Availability;
  },
): string | null {
  const templateId = normalizeKey(`${caliber}_${type}`);
  // Check against catalog
  for (const t of Object.values(AMMO_CATALOG)) {
    if (normalizeKey(t.templateId) === templateId) return null;
  }
  // Check against existing custom
  for (const id of Object.keys($customAmmoItems.get())) {
    if (normalizeKey(id) === templateId) return null;
  }
  const def: CustomAmmoDef = { caliber, type, ...fields };
  $customAmmoItems.set({ ...$customAmmoItems.get(), [templateId]: def });
  addAmmo(templateId);
  return templateId;
}

export function updateCustomAmmo(
  templateId: string,
  updates: Partial<Omit<CustomAmmoDef, "caliber" | "type">>,
): void {
  const current = $customAmmoItems.get();
  if (!(templateId in current)) return;
  $customAmmoItems.set({
    ...current,
    [templateId]: { ...current[templateId], ...updates },
  });
}

export function removeCustomAmmo(templateId: string): void {
  const currentDefs = $customAmmoItems.get();
  if (!(templateId in currentDefs)) return;
  const { [templateId]: _, ...restDefs } = currentDefs;
  $customAmmoItems.set(restDefs);
  // Also remove from quantities
  const currentQty = $ownedAmmo.get();
  if (templateId in currentQty) {
    const { [templateId]: __, ...restQty } = currentQty;
    $ownedAmmo.set(restQty);
  }
}

// --- Computed ---

/** All owned ammo: catalog items hydrated + custom items with qty > 0. */
export const $allOwnedAmmo = computed(
  [$ownedAmmo, $customAmmoItems],
  (quantities, customDefs): OwnedAmmoItem[] => {
    const items: OwnedAmmoItem[] = [];
    for (const [id, qty] of Object.entries(quantities)) {
      if (qty <= 0) continue;
      const catalogTemplate = AMMO_CATALOG[id];
      if (catalogTemplate) {
        items.push({ ...catalogTemplate, quantity: qty });
      } else {
        const custom = customDefs[id];
        if (custom) {
          items.push({
            templateId: id,
            caliber: custom.caliber,
            type: custom.type,
            damage: custom.damage,
            effects: custom.effects,
            description: custom.description,
            cost: custom.cost ?? 0,
            availability: custom.availability ?? "C",
            quantity: qty,
            custom: true,
          });
        }
      }
    }
    return items;
  },
);

/** Owned ammo grouped by caliber — used by reload popover for type switching. */
export const $ammoByCaliberLookup = computed(
  $allOwnedAmmo,
  (items): Record<string, OwnedAmmoItem[]> => {
    const grouped: Record<string, OwnedAmmoItem[]> = {};
    for (const item of items) {
      (grouped[item.caliber] ??= []).push(item);
    }
    return grouped;
  },
);

/** All custom ammo definitions as full AmmoTemplate objects. */
export const $customAmmoList = computed(
  [$customAmmoItems, $ownedAmmo],
  (customDefs, quantities): OwnedAmmoItem[] => {
    return Object.entries(customDefs).map(([id, def]) => ({
      templateId: id,
      caliber: def.caliber,
      type: def.type,
      damage: def.damage,
      effects: def.effects,
      description: def.description,
      cost: def.cost ?? 0,
      availability: def.availability ?? "C",
      quantity: quantities[id] ?? 0,
      custom: true,
    }));
  },
);
