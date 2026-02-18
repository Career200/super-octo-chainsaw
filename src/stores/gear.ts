import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";
import { GEAR_CATALOG } from "@scripts/gear/catalog";
import type { GearTemplate } from "@scripts/gear/catalog";

/**
 * Sparse persistence: only store templateId → quantity for owned gear.
 * Catalog data (name, description, etc.) comes from GEAR_CATALOG at read time.
 */
export type GearState = Record<string, number>;

function decodeGear(raw: string): GearState {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    // Drop entries with invalid quantities or unknown templates
    const result: GearState = {};
    for (const [id, qty] of Object.entries(parsed)) {
      if (id in GEAR_CATALOG && typeof qty === "number" && qty > 0) {
        result[id] = qty;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export const $gear = persistentAtom<GearState>("character-gear", {}, {
  encode: JSON.stringify,
  decode: decodeGear,
});

// --- Actions ---

export function addGear(templateId: string): void {
  if (!(templateId in GEAR_CATALOG)) return;
  const current = $gear.get();
  $gear.set({ ...current, [templateId]: (current[templateId] ?? 0) + 1 });
}

export function removeGear(templateId: string): void {
  const current = $gear.get();
  const qty = current[templateId];
  if (!qty) return;
  if (qty <= 1) {
    const { [templateId]: _, ...rest } = current;
    $gear.set(rest);
  } else {
    $gear.set({ ...current, [templateId]: qty - 1 });
  }
}

// --- Computed ---

export interface OwnedGearItem extends GearTemplate {
  quantity: number;
}

export const $ownedGear = computed($gear, (state): OwnedGearItem[] => {
  const items: OwnedGearItem[] = [];
  for (const [id, qty] of Object.entries(state)) {
    const template = GEAR_CATALOG[id];
    if (template && qty > 0) {
      items.push({ ...template, quantity: qty });
    }
  }
  return items;
});

export const $ownedGearCount = computed($ownedGear, (items) =>
  items.reduce((sum, i) => sum + i.quantity, 0),
);
