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
  cost: number; // eb per box
  boxSize: number; // rounds per box (corebook varies by caliber category)
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
  boxSize?: number;
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
  boxSize: number,
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
    boxSize,
    availability,
  };
}

/** Full bullet type set for a conventional caliber: std, ap, hp, api, rubber, dp. */
function bulletSet(
  caliber: string,
  damage: string,
  costStd: number,
  boxSize: number,
  availability: Availability = "C",
): AmmoTemplate[] {
  return [
    a(caliber, "std", damage, "", costStd, boxSize, availability),
    a(
      caliber,
      "ap",
      damage,
      "SP halved, pen halved",
      costStd * 3,
      boxSize,
      availability,
    ),
    a(
      caliber,
      "hp",
      damage,
      "SP x2, pen x1.5",
      Math.round(costStd * 1.125),
      boxSize,
      availability,
    ),
    a(
      caliber,
      "api",
      damage,
      "SP halved, pen halved, +1d6 fire, 1d6/2 burn",
      costStd * 4,
      boxSize,
      "R",
    ),
    a(
      caliber,
      "rubber",
      damage,
      "Stun beyond 3m; half real + half stun within 3m",
      Math.round(costStd / 3),
      boxSize,
      availability,
    ),
    a(
      caliber,
      "dp",
      damage,
      "SP halved OR pen x1.5 if unarmored",
      costStd * 4,
      boxSize,
      "P",
    ),
  ];
}

// --- Catalog ---

function buildCatalog(): Record<string, AmmoTemplate> {
  const entries: AmmoTemplate[] = [];

  // Light pistol calibers (box of 100, 15eb std)
  entries.push(...bulletSet("5mm", "1D6", 15, 100));
  entries.push(...bulletSet("6mm", "1D6+1", 15, 100));
  entries.push(...bulletSet(".22", "1D6", 15, 100, "E"));
  entries.push(...bulletSet(".25", "1D6+1", 15, 100));

  // Medium pistol & SMG calibers (box of 50, 15eb std)
  entries.push(...bulletSet("7mm", "1D6+2", 15, 50));
  entries.push(...bulletSet(".38", "1D6+2", 15, 50, "E"));
  entries.push(...bulletSet("9mm", "2D6+1", 15, 50, "E"));
  entries.push(...bulletSet("10mm", "2D6+3", 15, 50, "E"));
  entries.push(...bulletSet(".45", "2D6+2", 15, 50, "E"));
  entries.push(...bulletSet(".40", "2D6+3", 15, 50, "E"));

  // Heavy pistol calibers (box of 50, 18eb std)
  entries.push(...bulletSet("11mm", "3D6", 18, 50));
  entries.push(...bulletSet(".357", "3D6+1", 18, 50));
  entries.push(...bulletSet("5.7mm", "3D6", 18, 50));

  // Very heavy pistol calibers (box of 50, 20eb std)
  entries.push(...bulletSet("12mm", "4D6+1", 20, 50));
  entries.push(...bulletSet(".44", "4D6", 20, 50, "E"));

  // Assault rifle calibers (box of 100, 40eb std)
  entries.push(...bulletSet("5.56mm", "5D6", 40, 100, "E"));
  entries.push(...bulletSet("7.62mm", "6D6+2", 40, 100, "E"));
  entries.push(...bulletSet("7.62x39", "5D6+2", 40, 100));
  entries.push(...bulletSet("30-06", "5D6+1", 40, 100));

  // Shotgun 00: box of 12
  entries.push(a("00", "std", "4D6", "", 15, 12, "E", "Standard buckshot"));
  entries.push(
    a("00", "slug", "4D6", "SP halved", 15, 12, "E", "Solid slug round"),
  );
  entries.push(
    a(
      "00",
      "stinger",
      "2D6",
      "Stun damage, 3m spread",
      40,
      12,
      "C",
      "Non-lethal stinger round",
    ),
  );
  entries.push(
    a(
      "00",
      "gas",
      "—",
      "Tear gas cloud 3m radius",
      50,
      12,
      "P",
      "CS gas shell",
    ),
  );
  entries.push(
    a(
      "00",
      "flare",
      "1D6",
      "Illumination 50m radius, +1D6 fire",
      20,
      12,
      "E",
      "Signal/illumination flare",
    ),
  );
  entries.push(
    a(
      "00",
      "smoke",
      "—",
      "Smoke cloud 3m radius, 3 turns",
      30,
      12,
      "P",
      "Smoke screening shell",
    ),
  );
  entries.push(
    a(
      "00",
      "flash",
      "—",
      "Flashbang effect 3m radius",
      50,
      12,
      "P",
      "Disorientation shell",
    ),
  );

  // 20mm — sold individually
  entries.push(
    a(
      "20mm",
      "ap",
      "4D10",
      "SP halved, penetrating damage halved, armor damage x2",
      25,
      1,
      "R",
      "20mm cannon round",
    ),
  );

  // Arrows (box of 12)
  entries.push(
    a(
      "arrow",
      "training",
      "2D6",
      "SP halved",
      12,
      12,
      "E",
      "Lightweight training arrow",
    ),
  );
  entries.push(
    a(
      "arrow",
      "target",
      "4D6",
      "SP halved",
      24,
      12,
      "E",
      "Standard target arrow",
    ),
  );
  entries.push(
    a(
      "arrow",
      "broadhead",
      "4D6",
      "Soft SP halved, pen x2",
      60,
      12,
      "C",
      "Broadhead hunting arrow",
    ),
  );
  entries.push(
    a(
      "arrow",
      "stun",
      "4D6",
      "Stun damage only",
      24,
      12,
      "C",
      "Blunt tip stun arrow",
    ),
  );
  entries.push(
    a(
      "arrow",
      "spinner",
      "4D6",
      "Soft SP halved, pen x3",
      84,
      12,
      "P",
      "Armor-defeating spinner arrow",
    ),
  );

  // Crossbow bolts (box of 12)
  entries.push(
    a(
      "bolt",
      "training",
      "1D6+1",
      "SP halved",
      12,
      12,
      "E",
      "Lightweight training bolt",
    ),
  );
  entries.push(
    a(
      "bolt",
      "target",
      "3D6+3",
      "SP halved",
      30,
      12,
      "E",
      "Standard target bolt",
    ),
  );
  entries.push(
    a(
      "bolt",
      "broadhead",
      "3D6+3",
      "Soft SP halved, pen x2",
      60,
      12,
      "C",
      "Broadhead hunting bolt",
    ),
  );
  entries.push(
    a(
      "bolt",
      "stun",
      "3D6+3",
      "Stun damage only",
      24,
      12,
      "C",
      "Blunt stun bolt",
    ),
  );
  entries.push(
    a(
      "bolt",
      "spinner",
      "3D6+3",
      "Soft SP halved, pen x3",
      84,
      12,
      "P",
      "Armor-defeating spinner bolt",
    ),
  );

  // Needlegun (box of 50)
  entries.push(
    a(
      "needle",
      "normal",
      "1D6/2",
      "Ignores soft armor",
      25,
      50,
      "C",
      "Standard needle round",
    ),
  );
  entries.push(
    a(
      "needle",
      "drugged",
      "drugs",
      "Ignores soft armor, delivers drug payload",
      125,
      50,
      "C",
      "Drug-delivering needle",
    ),
  );

  // Airgun / paint (box of 100)
  entries.push(
    a(
      "paint",
      "paintball",
      "1",
      "Different colors, glowing, IR/UV paint available",
      6,
      100,
      "C",
      "Paintball round",
    ),
  );

  // Single-unit exotics
  entries.push(
    a(
      "napalm",
      "canister",
      "2D10",
      "+2D10/turn burn (3 turns)",
      50,
      1,
      "R",
      "Napalm canister",
    ),
  );
  entries.push(
    a(
      "battery",
      "cell",
      "1-5D6",
      "Variable power setting",
      100,
      1,
      "P",
      "Energy cell",
    ),
  );
  entries.push(
    a(
      "charge",
      "pack",
      "stun",
      "Taser charge",
      10,
      1,
      "C",
      "Taser charge pack",
    ),
  );

  const catalog: Record<string, AmmoTemplate> = {};
  for (const entry of entries) {
    catalog[entry.templateId] = entry;
  }
  return catalog;
}

export const AMMO_CATALOG: Record<string, AmmoTemplate> = buildCatalog();

/** Caliber display order for badge bar navigation. */
export const CALIBER_ORDER: string[] = [
  "5mm",
  "6mm",
  ".22",
  ".25",
  "7mm",
  ".38",
  "9mm",
  "10mm",
  ".45",
  ".40",
  "11mm",
  ".357",
  "5.7mm",
  "12mm",
  ".44",
  "5.56mm",
  "7.62mm",
  "7.62x39",
  "30-06",
  "00",
  "20mm",
  "arrow",
  "bolt",
  "needle",
  "paint",
  "napalm",
  "battery",
  "charge",
];
