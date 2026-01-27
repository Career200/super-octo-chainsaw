import { BODY_PARTS, type ArmorTemplate, type BodyPartName } from "./core";

const head: BodyPartName[] = ["head"];
const torso: BodyPartName[] = ["torso"];
const arms: BodyPartName[] = ["left_arm", "right_arm"];
const legs: BodyPartName[] = ["left_leg", "right_leg"];
const torsoArms: BodyPartName[] = ["torso", ...arms];
const fullBody: BodyPartName[] = BODY_PARTS.filter((p) => p !== "head");
const fullWithHead: BodyPartName[] = [...BODY_PARTS];

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

export const armorTemplates: Record<string, ArmorTemplate> = {
  // ===================
  // SOFT ARMORS
  // ===================

  // --- CLOTHING (SP 0-4) ---
  leather: template("leather", "Leather Jacket", "soft", 4, torsoArms, {
    cost: 50,
    description:
      "Good for road rash, stopping knives, etc. A good .38 slug will probably rip you to bits, however.",
  }),
  heavy_leather: template(
    "heavy_leather",
    "Heavy Leather Pants",
    "soft",
    4,
    legs,
    {
      cost: 50,
      description:
        "Good for road rash, stopping knives, etc. A good .38 slug will probably rip you to bits, however.",
    },
  ),

  // --- LIGHT SOFT (SP 10-14) ---
  kevlar_vest: template(
    "kevlar_vest",
    "Kevlar T-Shirt/Vest",
    "soft",
    10,
    torsoArms,
    {
      cost: 90,
      description:
        "Can be worn unnoticeably under most street clothes. Will stop most rounds up to a .45 ACP.",
    },
  ),
  light_armor_jacket: template(
    "light_armor_jacket",
    "Light Armor Jacket",
    "soft",
    14,
    torsoArms,
    {
      cost: 150,
      description:
        "Personal protection for the fashion conscious. Lightweight Kevlar with nylon covering that resembles a normal jacket.",
    },
  ),

  // --- MEDIUM SOFT (SP 18-20) ---
  med_armor_jacket: template(
    "med_armor_jacket",
    "Medium Armor Jacket",
    "soft",
    18,
    torsoArms,
    {
      cost: 200,
      ev: 1,
      description:
        "Personal protection for the fashion conscious. Kevlar jacket with nylon covering that resembles a normal jacket.",
    },
  ),
  heavy_armor_jacket: template(
    "heavy_armor_jacket",
    "Heavy Armor Jacket",
    "soft",
    20,
    torsoArms,
    {
      cost: 250,
      ev: 2,
      description:
        "Personal protection for the fashion conscious. Heavy Kevlar jacket with nylon covering that resembles a normal jacket.",
    },
  ),

  gibson_lvl1: template(
    "gibson_lvl1",
    "Gibson Form-Fitting Armor Lvl1",
    "soft",
    8,
    fullWithHead,
    {
      cost: 500,
      description:
        "Sleek, form-fitting body armor for maximum mobility. Radically comfortable.",
    },
  ),
  gibson_lvl2: template(
    "gibson_lvl2",
    "Gibson Form-Fitting Armor Lvl2",
    "soft",
    10,
    fullWithHead,
    {
      cost: 1000,
      description: "Thicker light armor suit with enhanced protection.",
    },
  ),

  m78_rpa_tshirt: template(
    "m78_rpa_tshirt",
    "M-78 RPA T-Shirt",
    "soft",
    8,
    torso,
    {
      cost: 120,
      description:
        "Consumer-grade light ballistic tee. AP-proof (treat SP as 2/3 when hit with AP).",
    },
  ),
  m78_rpa_jacket: template(
    "m78_rpa_jacket",
    "M-78 RPA Jacket",
    "soft",
    12,
    torsoArms,
    {
      cost: 180,
      description:
        "Light armor jacket used by Militech forces. Introduces m-78 AP-proof (treat SP as 2/3 when hit with AP).",
    },
  ),
  police_patrol: template(
    "police_patrol",
    "Police Patrol Armor",
    "soft",
    18,
    torso,
    {
      ev: 1,
      cost: 250,
      description: "Standard issue patrol armor for law enforcement.",
    },
  ),
  // ===================
  // HARD ARMORS
  // ===================

  // --- LIGHT HARD (SP 14) ---
  steel_helmet: template("steel_helmet", "Steel Helmet", "hard", 14, head, {
    cost: 20,
    description:
      "Heavy duty protection for the head, standard for most military. 90% have face shields with half the SP.",
  }),

  // --- MEDIUM HARD (SP 20) ---
  flak_vest: template("flak_vest", "Flak Vest", "hard", 20, torso, {
    cost: 200,
    ev: 1,
    description:
      "Standard protection for combat soldiers. Designed to stop small arms fire and grenade shrapnel, but only slow up assault rifle rounds.",
  }),
  flak_pants: template("flak_pants", "Flak Pants", "hard", 20, legs, {
    cost: 200,
    ev: 1,
    description:
      "Standard protection for combat soldiers. Designed to stop small arms fire and grenade shrapnel, but only slow up assault rifle rounds.",
  }),
  nylon_helmet: template(
    "nylon_helmet",
    "Ballistic Nylon Helmet",
    "hard",
    20,
    head,
    {
      cost: 100,
      description:
        "Heavy duty protection for the head. Made of kevlar and high impact plastics. 90% have face shields with half the SP.",
    },
  ),

  // --- HEAVY HARD (SP 25+) ---
  door_gunner_vest: template(
    "door_gunner_vest",
    "Door Gunner's Vest",
    "hard",
    25,
    torso,
    {
      cost: 250,
      ev: 3,
      description:
        "Heavy duty protection for stationary positions, like machinegun nests, helicopter doors, etc.",
    },
  ),
  metalgear: template("metalgear", "MetalGear", "hard", 25, fullWithHead, {
    cost: 600,
    ev: 2,
    description:
      "Laminated expoxide plate armor. Bulky and designed in modular sections: helmet, arm & leg coverings, torso and back clamshell.",
  }),

  nkvbda: template(
    "nkvbda",
    "Russian Arms NKVBDA 55",
    "hard",
    26,
    fullWithHead,
    {
      cost: 800,
      ev: 3,
      description:
        "A heavy combat Metal Gear supplied to Eastern European military and police. The helmet comes equipped with short range radio, IR, Anti Dazzle, HUD and enhanced audio pickup.",
    },
  ),

  // --- CORPORATE SECURITY (Kelmar) ---
  kelmar_class14: template(
    "kelmar_class14",
    "Kelmar Security Armor Class 14",
    "hard",
    18,
    fullBody,
    {
      cost: 1500,
      ev: 1,
      description:
        "Standard issue armor for Kelmar Security personnel. Torso/legs SP 18, arms SP 12.",
    },
  ),
  kelmar_class17: template(
    "kelmar_class17",
    "Kelmar Security Armor Class 17",
    "hard",
    22,
    fullBody,
    {
      cost: 2500,
      ev: 2,
      description:
        "Kelmar Heavy Security personnel armor. Torso SP 22, legs SP 20, arms SP 16.",
    },
  ),

  police_riot: template("police_riot", "Police Riot Armor", "hard", 22, torso, {
    cost: 400,
    ev: 2,
    description: "Heavy duty riot control armor for law enforcement.",
  }),

  corp_mil_armor: template(
    "corp_mil_armor",
    "Corp Military Body Armor",
    "hard",
    26,
    fullBody,
    {
      cost: 800,
      ev: 3,
      description: "Corporate military-grade body armor.",
    },
  ),
  cballistic_mesh: template(
    "cballistic_mesh",
    "C-Ballistic Light Mesh",
    "hard",
    18,
    fullBody,
    {
      cost: 500,
      ev: 1,
      description: "Lightweight ballistic mesh providing full body coverage.",
    },
  ),
};

export function getTemplate(templateId: string): ArmorTemplate | null {
  return armorTemplates[templateId] ?? null;
}
