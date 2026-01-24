const proportionalArmorBonus = (diff: number): number => {
  if (diff <= 4) return 5;
  if (diff <= 8) return 4;
  if (diff <= 14) return 3;
  if (diff <= 20) return 2;
  if (diff <= 26) return 1;
  return 0;
};

type ArmorType = "soft" | "hard";

export interface ArmorPiece {
  id: string; // unique identifier
  name: string;
  type: ArmorType;
  spTotal: number; // max SP
  spCurrent: number; // current SP
  bodyParts: BodyPartName[]; // parts this armor covers
  worn: boolean; // on/off
}

export type BodyPartName =
  | "head"
  | "torso"
  | "left_arm"
  | "right_arm"
  | "left_leg"
  | "right_leg";

interface BodyPart {
  layers: ArmorPiece[]; // max 3 layers, only 1 hard
}

export class CharacterArmor {
  body: Record<BodyPartName, BodyPart>;

  constructor() {
    this.body = {
      head: { layers: [] },
      torso: { layers: [] },
      left_arm: { layers: [] },
      right_arm: { layers: [] },
      left_leg: { layers: [] },
      right_leg: { layers: [] },
    };
  }

  // add armor layer to body part
  addArmor(armor: ArmorPiece) {
    for (const part of armor.bodyParts) {
      const layers = this.body[part].layers;

      if (layers.length >= 3) {
        console.warn(`Cannot add more than 3 layers to ${part}`);
        continue;
      }

      if (armor.type === "hard" && layers.some((l) => l.type === "hard")) {
        console.warn(`Only 1 hard armor allowed per ${part}`);
        continue;
      }

      layers.push(armor);
      armor.worn = true;
    }
  }

  // remove armor layer
  removeArmor(armor: ArmorPiece) {
    for (const part of armor.bodyParts) {
      this.body[part].layers = this.body[part].layers.filter(
        (l) => l.id !== armor.id,
      );
    }
    armor.worn = false;
  }

  // calculate effective SP per body part using proportional armor rule
  getEffectiveSP(part: BodyPartName): number {
    const layers = this.body[part].layers.filter((l) => l.worn);
    if (!layers.length) return 0;

    // sort by SP ascending for inside-out calculation
    const sorted = [...layers].sort((a, b) => a.spCurrent - b.spCurrent);

    let effectiveSP = sorted[0].spCurrent;

    for (let i = 1; i < sorted.length; i++) {
      const diff = Math.abs(sorted[i].spCurrent - effectiveSP);
      effectiveSP = sorted[i].spCurrent + proportionalArmorBonus(diff);
    }

    return effectiveSP;
  }

  // apply damage to a body part
  hit(part: BodyPartName, damage: number) {
    const layers = this.body[part].layers.filter((l) => l.worn);

    // sort outermost first (descending SP)
    const sorted = [...layers].sort((a, b) => b.spCurrent - a.spCurrent);

    let remainingDamage = damage;

    for (const layer of sorted) {
      if (layer.spCurrent <= 0) continue;

      const threshold =
        layer.type === "soft" ? layer.spCurrent : layer.spCurrent + 1;

      if (remainingDamage > threshold) {
        layer.spCurrent = Math.max(layer.spCurrent - 1, 0);
        remainingDamage -= threshold;
      } else {
        // hit stopped
        layer.spCurrent = Math.max(layer.spCurrent - 1, 0);
        remainingDamage = 0;
        break;
      }
    }

    return remainingDamage; // leftover damage to body
  }
}
