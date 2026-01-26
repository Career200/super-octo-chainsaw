import type { ArmorTemplate, BodyPartName } from "./core";

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

// Factory for creating armor templates
const template = (
  templateId: string,
  name: string,
  type: "soft" | "hard",
  spMax: number,
  bodyParts: BodyPartName[],
  opts?: { ev?: number; cost?: number; description?: string },
): ArmorTemplate => ({
  templateId,
  name,
  type,
  spMax,
  bodyParts,
  ev: opts?.ev,
  cost: opts?.cost,
  description: opts?.description,
});

// Static armor catalog - templates for spawning instances
export const armorTemplates: Record<string, ArmorTemplate> = {
  // --- STREET / LIGHT ---
  vest: template("vest", "Kevlar Vest", "soft", 20, torsoArms, { cost: 100 }),
  light_jacket: template("light_jacket", "Armored Jacket", "soft", 14, torsoArms, { cost: 50 }),
  kevlar_shirt: template("kevlar_shirt", "Kevlar Weave Shirt", "soft", 10, torso, { cost: 40 }),
  armored_hood: template("armored_hood", "Ballistic Hood", "soft", 8, head, { cost: 30 }),
  street_pants: template("street_pants", "Reinforced Street Pants", "soft", 12, legs, { cost: 45 }),

  // --- TACTICAL SOFT ---
  tac_vest: template("tac_vest", "Tactical Vest", "soft", 18, torsoArms, { cost: 150 }),
  riot_suit_soft: template("riot_suit_soft", "Riot Suit (Soft)", "soft", 16, fullBody, { cost: 200 }),
  kevlar_leggings: template("kevlar_leggings", "Kevlar Leggings", "soft", 15, legs, { cost: 80 }),

  // --- HARD TORSO ---
  plate: template("plate", "Ceramic Plate", "hard", 25, torso, { cost: 300, ev: -1 }),
  steel_plate: template("steel_plate", "Steel Trauma Plate", "hard", 28, torso, { cost: 400, ev: -2 }),
  milspec_plate: template("milspec_plate", "MilSpec Composite Plate", "hard", 30, torso, { cost: 600, ev: -2 }),

  // --- HARD LIMB ---
  hard_arm_guards: template("hard_arm_guards", "Hard Arm Guards", "hard", 18, arms, { cost: 200, ev: -1 }),
  hard_leg_braces: template("hard_leg_braces", "Hard Leg Braces", "hard", 20, legs, { cost: 250, ev: -1 }),

  // --- HEAD ---
  light_helmet: template("light_helmet", "Light Ballistic Helmet", "hard", 16, head, { cost: 150 }),
  heavy_helmet: template("heavy_helmet", "Heavy Assault Helmet", "hard", 22, head, { cost: 350, ev: -1 }),
  visor_mask: template("visor_mask", "Ballistic Visor Mask", "soft", 10, head, { cost: 60 }),

  // --- FULL SUITS ---
  flak_suit: template("flak_suit", "Flak Combat Suit", "soft", 20, fullBody, { cost: 400 }),
  corp_sec_suit: template("corp_sec_suit", "CorpSec Tactical Suit", "soft", 22, fullBody, { cost: 500 }),
  riot_suit_hard: template("riot_suit_hard", "Riot Control Suit (Hard Inserts)", "hard", 26, fullBody, { cost: 700, ev: -2 }),

  // --- HEAVY / MILITARY ---
  assault_harness: template("assault_harness", "Assault Harness System", "hard", 32, torsoArms, { cost: 1000, ev: -3 }),
  urban_exoshell: template("urban_exoshell", "Urban Exo-Shell", "hard", 35, fullWithHead, { cost: 2000, ev: -4 }),
  heavy_blast_suit: template("heavy_blast_suit", "Heavy Blast Suit", "hard", 40, fullWithHead, { cost: 3000, ev: -5 }),
};

// Helper to get a template by ID
export function getTemplate(templateId: string): ArmorTemplate | null {
  return armorTemplates[templateId] ?? null;
}
