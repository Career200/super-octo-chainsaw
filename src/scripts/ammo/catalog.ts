import type { Availability } from "@scripts/catalog-common";
export type { Availability } from "@scripts/catalog-common";

// --- Types ---

export interface AmmoTemplate {
  templateId: string; // caliber_type, e.g. "9mm_std", "9mm_ap", "00_slug"
  caliber: string; // short name, links to WeaponTemplate.ammo
  type: string; // free string: "std", "ap", "slug", etc.
  damage: string; // dice expression, overrides weapon damage when loaded
  effects: string; // compact plain text — informational, player applies manually
  description: string; // longer plain text shown in catalog.
  cost: number; // eb per box (see pricing section in plan). Custom form should note that cost is per box and not per round.
  availability: Availability;
}

/** User-created ammo definition — stored in full (no catalog entry to fall back on). */
export interface CustomAmmoDef {
  caliber: string;
  type: string;
  damage: string;
  effects: string;
  description: string;
  cost?: number;
  availability?: Availability;
}

/** Snapshot stored on WeaponInstance so combat card renders without catalog import. */
export interface LoadedAmmoInfo {
  templateId: string; // ammo catalog key, for reserve lookups on reload
  type: string; // short display label shown on combat card header
  damage: string; // overrides weapon template damage on combat card
  effects: string; // shown in cc-effect row
}

// --- Helpers ---

function a(
  caliber: string,
  type: string,
  damage: string,
  effects: string,
  cost: number,
  availability: Availability,
  description: string = "",
): AmmoTemplate {
  return {
    templateId: `${caliber}_${type}`,
    caliber,
    type,
    damage,
    effects,
    description,
    cost,
    availability,
  };
}

/** Standard + AP pair for a conventional caliber. */
function stdAp(
  caliber: string,
  damage: string,
  costStd: number,
  costAp: number,
  availability: Availability = "C",
): [AmmoTemplate, AmmoTemplate] {
  return [
    a(caliber, "std", damage, "", costStd, availability),
    a(
      caliber,
      "ap",
      damage,
      "SP halved, penetrating damage halved",
      costAp,
      availability,
    ),
  ];
}

// --- Catalog ---

function buildCatalog(): Record<string, AmmoTemplate> {
  const entries: AmmoTemplate[] = [];

  // Light pistol calibers (15eb/100 std)
  entries.push(...stdAp("5mm", "1D6", 15, 45));
  entries.push(...stdAp("6mm", "1D6+1", 15, 45));
  entries.push(...stdAp(".22", "1D6", 15, 45));
  entries.push(...stdAp(".25", "1D6+1", 15, 45));

  // Medium pistol & SMG calibers (30eb/100 std)
  entries.push(...stdAp("7mm", "1D6+2", 30, 90));
  entries.push(...stdAp(".38", "1D6+2", 30, 90));
  entries.push(...stdAp("9mm", "2D6+1", 30, 90));
  entries.push(...stdAp("10mm", "2D6+3", 30, 90));
  entries.push(...stdAp(".45", "2D6+2", 30, 90));
  entries.push(...stdAp(".40", "2D6+3", 30, 90));

  // Heavy pistol calibers (36eb/100 std)
  entries.push(...stdAp("11mm", "3D6", 36, 108));
  entries.push(...stdAp(".357", "3D6+1", 36, 108));
  entries.push(...stdAp("5.7mm", "3D6", 36, 108));

  // Very heavy pistol calibers (40eb/100 std)
  entries.push(...stdAp("12mm", "4D6+1", 40, 120));
  entries.push(...stdAp(".44", "4D6", 40, 120));

  // Assault rifle calibers (40eb/100 std)
  entries.push(...stdAp("5.56mm", "5D6", 40, 120));
  entries.push(...stdAp("7.62mm", "6D6+2", 40, 120));
  entries.push(...stdAp("7.62x39", "5D6+2", 40, 120));
  entries.push(...stdAp("30-06", "5D6+1", 40, 120));

  // Shotgun: std (buckshot) + slug instead of AP
  entries.push(a("00", "std", "4D6", "", 30, "C", "Standard buckshot"));
  entries.push(
    a("00", "slug", "4D6", "SP halved", 30, "C", "Solid slug round"),
  );

  // 20mm — already AP by default
  entries.push(
    a(
      "20mm",
      "ap",
      "4D10",
      "SP halved, penetrating damage halved",
      2500,
      "R",
      "20mm cannon round",
    ),
  );

  const catalog: Record<string, AmmoTemplate> = {};
  for (const entry of entries) {
    catalog[entry.templateId] = entry;
  }
  return catalog;
}

export const AMMO_CATALOG: Record<string, AmmoTemplate> = buildCatalog();
