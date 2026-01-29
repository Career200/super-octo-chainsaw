const proportionalArmorBonus = (diff: number): number => {
  if (diff <= 4) return 5;
  if (diff <= 8) return 4;
  if (diff <= 14) return 3;
  if (diff <= 20) return 2;
  if (diff <= 26) return 1;
  return 0;
};

export type ArmorType = "soft" | "hard";

export type BodyPartName =
  | "head"
  | "torso"
  | "left_arm"
  | "right_arm"
  | "left_leg"
  | "right_leg";

export const BODY_PARTS: BodyPartName[] = [
  "head",
  "torso",
  "left_arm",
  "right_arm",
  "left_leg",
  "right_leg",
];

export const PART_NAMES: Record<BodyPartName, string> = {
  head: "Head",
  torso: "Torso",
  left_arm: "Left Arm",
  right_arm: "Right Arm",
  left_leg: "Left Leg",
  right_leg: "Right Leg",
};

export const PART_ABBREV: Record<BodyPartName, string> = {
  head: "H",
  torso: "T",
  left_arm: "LA",
  right_arm: "RA",
  left_leg: "LL",
  right_leg: "RL",
};

export type ArmorLayer = "worn" | "plating" | "skinweave" | "subdermal";

// Static template - defines what an armor type IS
export interface ArmorTemplate {
  templateId: string;
  name: string;
  type: ArmorType;
  spMax: number;
  bodyParts: BodyPartName[];
  ev?: number;
  cost?: number;
  description?: string;
  layer?: ArmorLayer;
}

// Instance - an actual owned piece of armor (persistent state)
export interface ArmorInstance {
  id: string; // unique instance ID (e.g., "vest_a3f8")
  templateId: string; // references ArmorTemplate
  spByPart: Partial<Record<BodyPartName, number>>;
  worn: boolean;
}

// Merged view for rendering - template + instance state
export interface ArmorPiece extends ArmorTemplate {
  id: string; // instance ID
  spByPart: Partial<Record<BodyPartName, number>>;
  spCurrent: number;
  worn: boolean;
}

export function sortByLayerOrder<T extends { spCurrent: number }>(
  layers: T[],
): T[] {
  return [...layers].sort((a, b) => b.spCurrent - a.spCurrent);
}

export interface EffectiveSPOptions {
  implants?: ArmorPiece[];
  part?: BodyPartName;
}

export function getImplantSP(implant: ArmorPiece, part?: BodyPartName): number {
  return part ? (implant.spByPart[part] ?? 0) : implant.spCurrent;
}

// Calculate effective SP using proportional armor rule
// All layers sorted by SP (highest first) - strongest layer provides base protection
// Armor degradation is handled by layers, top to bottom
export function getEffectiveSP(
  layers: ArmorPiece[],
  options: EffectiveSPOptions = {},
): number {
  const { implants = [], part } = options;

  const activeLayers = layers.filter((l) => l.worn && l.spCurrent > 0);
  const activeImplants = implants.filter((i) => getImplantSP(i, part) > 0);

  if (activeLayers.length === 0 && activeImplants.length === 0) {
    return 0;
  }

  const allSP: number[] = [
    ...activeLayers.map((l) => l.spCurrent),
    ...activeImplants.map((i) => getImplantSP(i, part)),
  ].sort((a, b) => b - a);

  let effectiveSP = allSP[0];

  for (let i = 1; i < allSP.length; i++) {
    const layerSP = allSP[i];
    const diff = effectiveSP - layerSP;
    const bonus = Math.min(layerSP, proportionalArmorBonus(diff));
    effectiveSP += bonus;
  }

  return effectiveSP;
}

export function generateId(prefix: string): string {
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${random}`;
}

export interface EVResult {
  ev: number;
  maxLayers: number;
  maxLocation: BodyPartName | null;
}

// Calculate EV penalty:
// - Every worn armor piece and implant contributes its base EV
// - Layer penalty comes from the body part with the most layers
// - HOMERULE: Skinweave doesn't count toward the layer limit
export function getTotalEV(
  allWornArmor: ArmorPiece[],
  allInstalledImplants: ArmorPiece[],
): EVResult {
  let baseEV = allWornArmor.reduce((sum, armor) => sum + (armor.ev ?? 0), 0);
  baseEV += allInstalledImplants.reduce((sum, impl) => sum + (impl.ev ?? 0), 0);

  // HOMERULE: skinweave does not count toward layer limit
  const nonSkinweaveImplants = allInstalledImplants.filter(
    (a) => a.layer !== "skinweave",
  );

  let maxLayers = 0;
  let maxLocation: BodyPartName | null = null;

  for (const part of BODY_PARTS) {
    const wornAtPart = allWornArmor.filter((a) => a.bodyParts.includes(part));
    const implantsAtPart = nonSkinweaveImplants.filter((a) =>
      a.bodyParts.includes(part),
    );
    const totalLayers = wornAtPart.length + implantsAtPart.length;

    if (totalLayers > maxLayers) {
      maxLayers = totalLayers;
      maxLocation = part;
    }
  }

  const layerPenalty = maxLayers >= 3 ? 3 : maxLayers >= 2 ? 1 : 0;

  return {
    ev: baseEV + layerPenalty,
    maxLayers,
    maxLocation,
  };
}
