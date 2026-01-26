const proportionalArmorBonus = (diff: number): number => {
  if (diff <= 4) return 5;
  if (diff <= 8) return 4;
  if (diff <= 14) return 3;
  if (diff <= 20) return 2;
  if (diff <= 26) return 1;
  return 0;
};

export type ArmorType = "soft" | "hard";

export interface ArmorPiece {
  id: string;
  name: string;
  type: ArmorType;
  spTotal: number;
  spCurrent: number;
  bodyParts: BodyPartName[];
  ev?: number;
  worn?: boolean;
  description?: string;

  // weaponMount?: boolean;
  // linkedWeaponId?: string;
}

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

// Calculate effective SP using proportional armor rule
// Pure function - takes layers, returns SP
export function getEffectiveSP(layers: ArmorPiece[]): number {
  const activeLayers = layers.filter((l) => l.worn && l.spCurrent > 0);
  if (!activeLayers.length) return 0;

  // Sort by SP ascending for inside-out calculation
  const sorted = [...activeLayers].sort((a, b) => a.spCurrent - b.spCurrent);

  let effectiveSP = sorted[0].spCurrent;

  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.abs(sorted[i].spCurrent - effectiveSP);
    effectiveSP = sorted[i].spCurrent + proportionalArmorBonus(diff);
  }

  return effectiveSP;
}

// Calculate damage penetration through armor layers
// Returns remaining damage that gets through to the body
export function calculateDamage(
  layers: ArmorPiece[],
  damage: number,
): { penetrating: number; degradation: Map<string, number> } {
  const activeLayers = layers.filter((l) => l.worn && l.spCurrent > 0);
  const degradation = new Map<string, number>();

  // Sort outermost first (descending SP)
  const sorted = [...activeLayers].sort((a, b) => b.spCurrent - a.spCurrent);

  let remainingDamage = damage;

  for (const layer of sorted) {
    if (remainingDamage <= 0) break;

    const threshold =
      layer.type === "soft" ? layer.spCurrent : layer.spCurrent + 1;

    if (remainingDamage > threshold) {
      degradation.set(layer.id, 1);
      remainingDamage -= threshold;
    } else {
      degradation.set(layer.id, 1);
      remainingDamage = 0;
      break;
    }
  }

  return { penetrating: remainingDamage, degradation };
}
