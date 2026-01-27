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
}

// Instance - an actual owned piece of armor (persistent state)
export interface ArmorInstance {
  id: string; // unique instance ID (e.g., "vest_a3f8")
  templateId: string; // references ArmorTemplate
  spCurrent: number;
  worn: boolean;
}

// Merged view for rendering - template + instance state
export interface ArmorPiece extends ArmorTemplate {
  id: string; // instance ID
  spCurrent: number;
  worn: boolean;
}

// Calculate effective SP using proportional armor rule
export function getEffectiveSP(layers: ArmorPiece[]): number {
  const activeLayers = layers.filter((l) => l.worn && l.spCurrent > 0);
  if (!activeLayers.length) return 0;

  const sorted = [...activeLayers].sort((a, b) => a.spCurrent - b.spCurrent);
  let effectiveSP = sorted[0].spCurrent;

  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.abs(sorted[i].spCurrent - effectiveSP);
    effectiveSP = sorted[i].spCurrent + proportionalArmorBonus(diff);
  }

  return effectiveSP;
}

// Generate unique instance ID
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
// - Every worn armor piece contributes its base EV
// - Layer penalty comes from the body part with the most layers
export function getTotalEV(
  getLayersForPart: (part: BodyPartName) => ArmorPiece[],
  allWornArmor: ArmorPiece[],
): EVResult {
  const baseEV = allWornArmor.reduce((sum, armor) => sum + (armor.ev ?? 0), 0);

  let maxLayers = 0;
  let maxLocation: BodyPartName | null = null;
  for (const part of BODY_PARTS) {
    const layers = getLayersForPart(part).filter((l) => l.worn);
    if (layers.length > maxLayers) {
      maxLayers = layers.length;
      maxLocation = part;
    }
  }

  const layerPenalty = maxLayers >= 3 ? 3 : maxLayers >= 2 ? 1 : 0;

  return { ev: baseEV + layerPenalty, maxLayers, maxLocation };
}
