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

// Static armor definitions (immutable base data)
export const armorDefaults: Record<string, ArmorPiece> = {
  // --- STREET / LIGHT ---
  vest: {
    id: "vest",
    name: "Kevlar Vest",
    type: "soft",
    spTotal: 20,
    spCurrent: 20,
    bodyParts: torsoArms,
    worn: false,
  },
  light_jacket: {
    id: "light_jacket",
    name: "Armored Jacket",
    type: "soft",
    spTotal: 14,
    spCurrent: 14,
    bodyParts: torsoArms,
    worn: false,
  },
  kevlar_shirt: {
    id: "kevlar_shirt",
    name: "Kevlar Weave Shirt",
    type: "soft",
    spTotal: 10,
    spCurrent: 10,
    bodyParts: torso,
    worn: false,
  },
  armored_hood: {
    id: "armored_hood",
    name: "Ballistic Hood",
    type: "soft",
    spTotal: 8,
    spCurrent: 8,
    bodyParts: head,
    worn: false,
  },
  street_pants: {
    id: "street_pants",
    name: "Reinforced Street Pants",
    type: "soft",
    spTotal: 12,
    spCurrent: 12,
    bodyParts: legs,
    worn: false,
  },

  // --- TACTICAL SOFT ---
  tac_vest: {
    id: "tac_vest",
    name: "Tactical Vest",
    type: "soft",
    spTotal: 18,
    spCurrent: 18,
    bodyParts: torsoArms,
    worn: false,
  },
  riot_suit_soft: {
    id: "riot_suit_soft",
    name: "Riot Suit (Soft)",
    type: "soft",
    spTotal: 16,
    spCurrent: 16,
    bodyParts: fullBody,
    worn: false,
  },
  kevlar_leggings: {
    id: "kevlar_leggings",
    name: "Kevlar Leggings",
    type: "soft",
    spTotal: 15,
    spCurrent: 15,
    bodyParts: legs,
    worn: false,
  },

  // --- HARD TORSO ---
  plate: {
    id: "plate",
    name: "Ceramic Plate",
    type: "hard",
    spTotal: 25,
    spCurrent: 25,
    bodyParts: torso,
    worn: false,
  },
  steel_plate: {
    id: "steel_plate",
    name: "Steel Trauma Plate",
    type: "hard",
    spTotal: 28,
    spCurrent: 28,
    bodyParts: torso,
    worn: false,
  },
  milspec_plate: {
    id: "milspec_plate",
    name: "MilSpec Composite Plate",
    type: "hard",
    spTotal: 30,
    spCurrent: 30,
    bodyParts: torso,
    worn: false,
  },

  // --- HARD LIMB PROTECTION ---
  hard_arm_guards: {
    id: "hard_arm_guards",
    name: "Hard Arm Guards",
    type: "hard",
    spTotal: 18,
    spCurrent: 18,
    bodyParts: arms,
    worn: false,
  },
  hard_leg_braces: {
    id: "hard_leg_braces",
    name: "Hard Leg Braces",
    type: "hard",
    spTotal: 20,
    spCurrent: 20,
    bodyParts: legs,
    worn: false,
  },

  // --- HEAD ---
  light_helmet: {
    id: "light_helmet",
    name: "Light Ballistic Helmet",
    type: "hard",
    spTotal: 16,
    spCurrent: 16,
    bodyParts: head,
    worn: false,
  },
  heavy_helmet: {
    id: "heavy_helmet",
    name: "Heavy Assault Helmet",
    type: "hard",
    spTotal: 22,
    spCurrent: 22,
    bodyParts: head,
    worn: false,
  },
  visor_mask: {
    id: "visor_mask",
    name: "Ballistic Visor Mask",
    type: "soft",
    spTotal: 10,
    spCurrent: 10,
    bodyParts: head,
    worn: false,
  },

  // --- FULL SUITS ---
  flak_suit: {
    id: "flak_suit",
    name: "Flak Combat Suit",
    type: "soft",
    spTotal: 20,
    spCurrent: 20,
    bodyParts: fullBody,
    worn: false,
  },
  corp_sec_suit: {
    id: "corp_sec_suit",
    name: "CorpSec Tactical Suit",
    type: "soft",
    spTotal: 22,
    spCurrent: 22,
    bodyParts: fullBody,
    worn: false,
  },
  riot_suit_hard: {
    id: "riot_suit_hard",
    name: "Riot Control Suit (Hard Inserts)",
    type: "hard",
    spTotal: 26,
    spCurrent: 26,
    bodyParts: fullBody,
    worn: false,
  },

  // --- HEAVY / MILITARY ---
  assault_harness: {
    id: "assault_harness",
    name: "Assault Harness System",
    type: "hard",
    spTotal: 32,
    spCurrent: 32,
    bodyParts: torsoArms,
    worn: false,
  },
  urban_exoshell: {
    id: "urban_exoshell",
    name: "Urban Exo-Shell",
    type: "hard",
    spTotal: 35,
    spCurrent: 35,
    bodyParts: fullWithHead,
    worn: false,
  },
  heavy_blast_suit: {
    id: "heavy_blast_suit",
    name: "Heavy Blast Suit",
    type: "hard",
    spTotal: 40,
    spCurrent: 40,
    bodyParts: fullWithHead,
    worn: false,
  },
};

// Legacy alias - prefer using the store for mutable state
export const armorCatalog = armorDefaults;
