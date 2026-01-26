import type { ArmorPiece, BodyPartName } from "./core";

const head: BodyPartName[] = ["head"];
const torso: BodyPartName[] = ["torso"];
const arms: BodyPartName[] = ["left_arm", "right_arm"];
const legs: BodyPartName[] = ["left_leg", "right_leg"];
const torsoArms: BodyPartName[] = ["torso", "left_arm", "right_arm"];
const fullBody: BodyPartName[] = [
  "torso",
  "left_arm",
  "right_arm",
  "left_leg",
  "right_leg",
];
const fullWithHead: BodyPartName[] = [
  "head",
  "torso",
  "left_arm",
  "right_arm",
  "left_leg",
  "right_leg",
];

const armor = (
  id: string,
  name: string,
  type: "soft" | "hard",
  sp: number,
  bodyParts: BodyPartName[],
  opts?: { ev?: number; description?: string },
): ArmorPiece => ({
  id,
  name,
  type,
  spTotal: sp,
  spCurrent: sp,
  bodyParts,
  ev: opts?.ev ?? 0,
  worn: false,
  description: opts?.description,
});

export const armorDefaults: Record<string, ArmorPiece> = {
  vest: armor("vest", "Kevlar Vest", "soft", 20, torsoArms),
  light_jacket: armor("light_jacket", "Armored Jacket", "soft", 14, torsoArms),
  kevlar_shirt: armor("kevlar_shirt", "Kevlar Weave Shirt", "soft", 10, torso),
  armored_hood: armor("armored_hood", "Ballistic Hood", "soft", 8, head),
  street_pants: armor(
    "street_pants",
    "Reinforced Street Pants",
    "soft",
    12,
    legs,
  ),

  tac_vest: armor("tac_vest", "Tactical Vest", "soft", 18, torsoArms),
  riot_suit_soft: armor(
    "riot_suit_soft",
    "Riot Suit (Soft)",
    "soft",
    16,
    fullBody,
  ),
  kevlar_leggings: armor(
    "kevlar_leggings",
    "Kevlar Leggings",
    "soft",
    15,
    legs,
  ),

  plate: armor("plate", "Ceramic Plate", "hard", 25, torso),
  steel_plate: armor("steel_plate", "Steel Trauma Plate", "hard", 28, torso),
  milspec_plate: armor(
    "milspec_plate",
    "MilSpec Composite Plate",
    "hard",
    30,
    torso,
  ),

  hard_arm_guards: armor(
    "hard_arm_guards",
    "Hard Arm Guards",
    "hard",
    18,
    arms,
  ),
  hard_leg_braces: armor(
    "hard_leg_braces",
    "Hard Leg Braces",
    "hard",
    20,
    legs,
  ),

  light_helmet: armor(
    "light_helmet",
    "Light Ballistic Helmet",
    "hard",
    16,
    head,
  ),
  heavy_helmet: armor("heavy_helmet", "Heavy Assault Helmet", "hard", 22, head),
  visor_mask: armor("visor_mask", "Ballistic Visor Mask", "soft", 10, head),

  flak_suit: armor("flak_suit", "Flak Combat Suit", "soft", 20, fullBody),
  corp_sec_suit: armor(
    "corp_sec_suit",
    "CorpSec Tactical Suit",
    "soft",
    22,
    fullBody,
  ),
  riot_suit_hard: armor(
    "riot_suit_hard",
    "Riot Control Suit (Hard Inserts)",
    "hard",
    26,
    fullBody,
  ),

  assault_harness: armor(
    "assault_harness",
    "Assault Harness System",
    "hard",
    32,
    torsoArms,
  ),
  urban_exoshell: armor(
    "urban_exoshell",
    "Urban Exo-Shell",
    "hard",
    35,
    fullWithHead,
  ),
  heavy_blast_suit: armor(
    "heavy_blast_suit",
    "Heavy Blast Suit",
    "hard",
    40,
    fullWithHead,
  ),
};
