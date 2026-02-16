import {
  BODY_PARTS,
  type ArmorTemplate,
  type ArmorLayer,
  type BodyPartName,
} from "./core";

const head: BodyPartName[] = ["head"];
const headFace: BodyPartName[] = ["head", "face"];
const torso: BodyPartName[] = ["torso"];
const arms: BodyPartName[] = ["left_arm", "right_arm"];
const legs: BodyPartName[] = ["left_leg", "right_leg"];
const torsoArms: BodyPartName[] = ["torso", ...arms];
const fullBody: BodyPartName[] = BODY_PARTS.filter(
  (p) => p !== "head" && p !== "face",
);
const fullWithHead: BodyPartName[] = BODY_PARTS.filter((p) => p !== "face");
const allParts: BodyPartName[] = [...BODY_PARTS];

const template = (
  templateId: string,
  name: string,
  type: "soft" | "hard",
  spMax: number,
  bodyParts: BodyPartName[],
  opts?: {
    shortName?: string;
    ev?: number;
    cost?: number;
    description?: string;
    layer?: ArmorLayer;
  },
): ArmorTemplate => ({
  templateId,
  name,
  shortName: opts?.shortName,
  type,
  spMax,
  bodyParts,
  ev: opts?.ev,
  cost: opts?.cost,
  description: opts?.description,
  layer: opts?.layer,
});

const skinweaves = (levels: number[]): Record<string, ArmorTemplate> =>
  Object.fromEntries(
    levels.map((sp) => [
      `skinweave_${sp}`,
      template(`skinweave_${sp}`, `SkinWeave SP ${sp}`, "soft", sp, allParts, {
        shortName: `SW ${sp}`,
        layer: "skinweave",
        description:
          "Woven armor fibers grown into the skin. Provides uniform protection across the entire body.",
      }),
    ]),
  );

export const armorTemplates: Record<string, ArmorTemplate> = {
  // ===================
  // SOFT ARMORS
  // ===================

  // --- CLOTHING (SP 0-4) ---
  leather: template("leather", "Leather Jacket", "soft", 4, torsoArms, {
    shortName: "Leather J",
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
      shortName: "Leather P",
      cost: 50,
      description:
        "Good for road rash, stopping knives, etc. A good .38 slug will probably rip you to bits, however.",
    },
  ),

  // --- LIGHT SOFT (SP 10-14) ---

  armor_jacket_hood: template(
    "armor_jacket_hood",
    "Armor Jacket Hood",
    "soft",
    10,
    head,
    {
      shortName: "Armor Hood",
      cost: 80,
      description:
        "Light hood that can be attached to jackets or worn as a hat. Provides head protection without the bulk of a helmet.",
    },
  ),
  light_armor_pants: template(
    "light_armor_pants",
    "Light Armor Pants",
    "soft",
    10,
    legs,
    {
      shortName: "Lt ArmorPants",
      cost: 120,
      description:
        "Pants with lightweight Kevlar inserts. Non-restrictive and stylish, with protection for the legs against small arms fire.",
    },
  ),
  kevlar_vest: template(
    "kevlar_vest",
    "Kevlar T-Shirt/Vest",
    "soft",
    12,
    torsoArms,
    {
      shortName: "Kevlar V",
      cost: 90,
      description:
        "Mostly unnoticeable under street clothes. Will stop most rounds up to a .45 ACP.",
    },
  ),
  light_armor_jacket: template(
    "light_armor_jacket",
    "Light Armor Jacket",
    "soft",
    14,
    torsoArms,
    {
      shortName: "Lt ArmorJack",
      cost: 150,
      description:
        "Personal protection for the fashion conscious. Lightweight Kevlar with nylon covering that could pass as a normal jacket.",
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
      shortName: "Med ArmorJack",
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
      shortName: "Hvy ArmorJack",
      cost: 250,
      ev: 2,
      description:
        "Personal protection for the fashion conscious. Heavy Kevlar jacket with plasteel lamellar inserts. Hot and heavy, strongly associated with street gangs",
    },
  ),

  gibson_lvl1: template(
    "gibson_lvl1",
    "Gibson Form-Fitting Armor Lvl1",
    "soft",
    8,
    fullWithHead,
    {
      shortName: "BodySuit 1",
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
      shortName: "BodySuit 2",
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
      shortName: "M-78 Tee",
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
      shortName: "M-78 Jack",
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
      shortName: "Patrol",
      ev: 1,
      cost: 250,
      description: "Standard issue patrol armor for law enforcement.",
    },
  ),
  // ===================
  // HARD ARMORS
  // ===================

  // --- LIGHT HARD (SP 14) ---
  steel_helmet: template("steel_helmet", "Steel Helmet", "hard", 14, headFace, {
    shortName: "Steel H",
    cost: 20,
    description:
      "Heavy duty protection for the head, standard for most military. Most have face shields with half the SP.",
  }),

  // --- MEDIUM HARD (SP 20) ---
  flak_vest: template("flak_vest", "Flak Vest", "hard", 20, torso, {
    shortName: "Flak V",
    cost: 200,
    ev: 1,
    description:
      "Standard protection for combat soldiers. Designed to stop small arms fire and grenade shrapnel, but only slow up assault rifle rounds.",
  }),
  flak_pants: template("flak_pants", "Flak Pants", "hard", 20, legs, {
    shortName: "Flak P",
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
    headFace,
    {
      shortName: "Nylon H",
      cost: 100,
      description:
        "Heavy duty protection for the head. Made of kevlar and high impact plastics. Most have face shields with half the SP.",
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
      shortName: "Door Gunner",
      cost: 250,
      ev: 3,
      description:
        "Heavy duty protection for stationary positions, like machinegun nests, helicopter doors, etc.",
    },
  ),
  metalgear: template("metalgear", "MetalGear", "hard", 25, allParts, {
    cost: 600,
    ev: 2,
    description:
      "Laminated expoxide plate armor. Bulky and designed in modular sections: helmet, arm & leg coverings, torso and back clamshell.",
  }),

  nkvbda: template("nkvbda", "Russian Arms NKVBDA 55", "hard", 26, allParts, {
    shortName: "NKVBDA",
    cost: 800,
    ev: 3,
    description:
      "A heavy combat Metal Gear supplied to Eastern European military and police. The helmet comes equipped with short range radio, IR, Anti Dazzle, HUD and enhanced audio pickup.",
  }),

  // --- CORPORATE SECURITY (Kelmar) ---
  kelmar_class14: template(
    "kelmar_class14",
    "Kelmar Security Armor Class 14",
    "hard",
    18,
    fullBody,
    {
      shortName: "Kelmar 14",
      cost: 1500,
      ev: 1,
      description: "Common standard issue security personnel armor.",
    },
  ),
  kelmar_class17: template(
    "kelmar_class17",
    "Kelmar Security Armor Class 17",
    "hard",
    22,
    fullBody,
    {
      shortName: "Kelmar 17",
      cost: 2500,
      ev: 2,
      description:
        "Upgraded armor for security personnel, with improved protection, materials and design.",
    },
  ),

  police_riot: template("police_riot", "Police Riot Armor", "hard", 22, torso, {
    shortName: "Riot",
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
      shortName: "Corp Mil",
      cost: 800,
      ev: 3,
      description: "Corporate frontline body armor.",
    },
  ),
  cballistic_mesh: template(
    "cballistic_mesh",
    "C-Ballistic Light Mesh",
    "hard",
    18,
    fullBody,
    {
      shortName: "C-Ballistic",
      cost: 500,
      ev: 1,
      description: "Lightweight ballistic mesh providing full body coverage.",
    },
  ),
  cballistic_mesh_hood: template(
    "cballistic_mesh_hood",
    "C-Ballistic Mesh Hood",
    "hard",
    18,
    head,
    {
      shortName: "C-Ballistic Hood",
      cost: 300,
      ev: 1,
      description:
        "C-ballistic mesh armor comes with detachable hood providing head coverage.",
    },
  ),

  // ===================
  // IMPLANTS (Cyberware)
  // ===================

  // --- SKINWEAVE ---
  ...skinweaves([8, 10, 12, 14]),

  // --- OTHER IMPLANTS ---
  subdermal: template("subdermal", "Subdermal Armor", "soft", 18, torso, {
    shortName: "Subdermal",
    layer: "subdermal",
    description:
      "Armored plastic laminates inserted under the skin for protection.",
  }),
  cowl: template("cowl", "Cowl (Plating)", "hard", 25, head, {
    shortName: "Cowl",
    layer: "plating",
    description:
      "Body plate covering the skull, anchored by minibolts to the scalp.",
  }),
  faceplate: template(
    "faceplate",
    "Faceplate (Plating)",
    "hard",
    25,
    ["face"],
    {
      shortName: "Faceplate",
      layer: "faceplate",
      description:
        "Covers the entire face with ports for breathing, eating and seeing. Woven with myomar muscle fibers for limited expression.",
    },
  ),
  torso_plate: template("torso_plate", "Torso (Plating)", "hard", 25, torso, {
    shortName: "Torso Plate",
    layer: "plating",
    ev: 3,
    description:
      "Covers entire upper and lower torso with expansion joints for movement.",
  }),
};

export function getTemplate(templateId: string): ArmorTemplate | null {
  return armorTemplates[templateId] ?? null;
}
