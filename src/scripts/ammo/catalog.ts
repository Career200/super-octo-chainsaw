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

/** Full bullet type set for a conventional caliber: std, ap, hp, api, rubber, et, dp. */
function bulletSet(
  caliber: string,
  damage: string,
  costStd: number,
  availability: Availability = "C",
): AmmoTemplate[] {
  return [
    a(caliber, "std", damage, "", costStd, availability),
    a(
      caliber,
      "ap",
      damage,
      "SP halved, pen halved",
      costStd * 3,
      availability,
    ),
    a(
      caliber,
      "hp",
      damage,
      "SP x2, pen x1.5",
      Math.round(costStd * 1.125),
      availability,
    ),
    a(
      caliber,
      "api",
      damage,
      "SP halved, pen halved, +1d6 fire, 1d6/2 burn",
      costStd * 4,
      "P",
    ),
    a(
      caliber,
      "rubber",
      damage,
      "Stun beyond 3m; half real + half stun within 3m",
      Math.round(costStd / 3),
      availability,
    ),
    a(
      caliber,
      "et",
      damage,
      "Damage x1.5 (electrothermal ignition only)",
      costStd * 2,
      "P",
    ),
    a(
      caliber,
      "dp",
      damage,
      "SP halved OR pen x1.5 if unarmored",
      costStd * 4,
      "P",
    ),
  ];
}

// --- Catalog ---

function buildCatalog(): Record<string, AmmoTemplate> {
  const entries: AmmoTemplate[] = [];

  // Light pistol calibers (15eb/100 std)
  entries.push(...bulletSet("5mm", "1D6", 15));
  entries.push(...bulletSet("6mm", "1D6+1", 15));
  entries.push(...bulletSet(".22", "1D6", 15));
  entries.push(...bulletSet(".25", "1D6+1", 15));

  // Medium pistol & SMG calibers (30eb/100 std)
  entries.push(...bulletSet("7mm", "1D6+2", 30));
  entries.push(...bulletSet(".38", "1D6+2", 30));
  entries.push(...bulletSet("9mm", "2D6+1", 30));
  entries.push(...bulletSet("10mm", "2D6+3", 30));
  entries.push(...bulletSet(".45", "2D6+2", 30));
  entries.push(...bulletSet(".40", "2D6+3", 30));

  // Heavy pistol calibers (36eb/100 std)
  entries.push(...bulletSet("11mm", "3D6", 36));
  entries.push(...bulletSet(".357", "3D6+1", 36));
  entries.push(...bulletSet("5.7mm", "3D6", 36));

  // Very heavy pistol calibers (40eb/100 std)
  entries.push(...bulletSet("12mm", "4D6+1", 40));
  entries.push(...bulletSet(".44", "4D6", 40));

  // Assault rifle calibers (40eb/100 std)
  entries.push(...bulletSet("5.56mm", "5D6", 40));
  entries.push(...bulletSet("7.62mm", "6D6+2", 40));
  entries.push(...bulletSet("7.62x39", "5D6+2", 40));
  entries.push(...bulletSet("30-06", "5D6+1", 40));

  // Shotgun 00: std, slug + specialty shells
  entries.push(a("00", "std", "4D6", "", 30, "C", "Standard buckshot"));
  entries.push(
    a("00", "slug", "4D6", "SP halved", 30, "C", "Solid slug round"),
  );
  entries.push(
    a(
      "00",
      "stinger",
      "2D6",
      "Stun damage, 3m spread",
      40,
      "C",
      "Non-lethal stinger round",
    ),
  );
  entries.push(
    a("00", "gas", "—", "Tear gas cloud 3m radius", 50, "P", "CS gas shell"),
  );
  entries.push(
    a(
      "00",
      "flare",
      "1D6",
      "Illumination 50m radius, +1D6 fire",
      20,
      "C",
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
      "C",
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
      "P",
      "Disorientation shell",
    ),
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

  // Arrows (bow, weapon base 4D6)
  entries.push(
    a("arrow", "target", "4D6", "SP halved", 2, "C", "Standard target arrow"),
  );
  entries.push(
    a(
      "arrow",
      "broadhead",
      "4D6",
      "Soft SP halved, pen x2",
      5,
      "C",
      "Broadhead hunting arrow",
    ),
  );
  entries.push(
    a("arrow", "stun", "4D6", "Stun damage only", 2, "C", "Blunt stun arrow"),
  );
  entries.push(
    a(
      "arrow",
      "spinner",
      "4D6",
      "Soft SP halved, pen x3",
      7,
      "P",
      "Armor-defeating spinner arrow",
    ),
  );

  // Crossbow bolts (weapon base 3D6+3)
  entries.push(
    a("bolt", "target", "3D6+3", "SP halved", 2, "C", "Standard target bolt"),
  );
  entries.push(
    a(
      "bolt",
      "broadhead",
      "3D6+3",
      "Soft SP halved, pen x2",
      5,
      "C",
      "Broadhead hunting bolt",
    ),
  );
  entries.push(
    a("bolt", "stun", "3D6+3", "Stun damage only", 2, "C", "Blunt stun bolt"),
  );
  entries.push(
    a(
      "bolt",
      "spinner",
      "3D6+3",
      "Soft SP halved, pen x3",
      7,
      "P",
      "Armor-defeating spinner bolt",
    ),
  );

  // Needlegun
  entries.push(
    a(
      "needle",
      "normal",
      "1D6/2",
      "Ignores soft armor",
      50,
      "P",
      "Standard needle round",
    ),
  );
  entries.push(
    a(
      "needle",
      "drugged",
      "drugs",
      "Ignores soft armor, delivers drug payload",
      250,
      "R",
      "Drug-delivering needle",
    ),
  );

  // Paint caliber
  entries.push(
    a(
      "paint",
      "paintball",
      "1",
      "Different colors, glowing, IR/UV paint available",
      10,
      "C",
      "Paintball round",
    ),
  );

  // Single-type exotics
  entries.push(
    a(
      "napalm",
      "canister",
      "2D10",
      "+2D10/turn burn (3 turns)",
      50,
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
      "P",
      "Energy cell",
    ),
  );
  entries.push(
    a("charge", "pack", "stun", "Taser charge", 10, "C", "Taser charge pack"),
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
