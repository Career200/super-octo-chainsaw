import {
  BODY_PARTS,
  type ArmorTemplate,
  type ArmorLayer,
  type Availability,
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
  cost: number,
  availability: Availability,
  description: string,
  opts?: {
    shortName?: string;
    ev?: number;
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
  cost,
  description,
  availability,
  layer: opts?.layer,
});

// =====================
// ARMOR CATALOG (non-implant wearable armor)
// =====================

export const ARMOR_CATALOG: Record<string, ArmorTemplate> = {
  // --- SOFT: CLOTHING (SP 0-4) ---
  leather: template(
    "leather", "Leather Jacket", "soft", 4, torsoArms,
    50, "E",
    "Good for road rash, stopping knives, etc. A good .38 slug will probably rip you to bits, however.",
    { shortName: "Leather J" },
  ),
  heavy_leather: template(
    "heavy_leather", "Heavy Leather Pants", "soft", 4, legs,
    50, "E",
    "Good for road rash, stopping knives, etc. A good .38 slug will probably rip you to bits, however.",
    { shortName: "Leather P" },
  ),

  // --- SOFT: LIGHT (SP 8-14) ---
  gibson_lvl1: template(
    "gibson_lvl1", "Gibson Form-Fitting Armor Lvl1", "soft", 8, fullWithHead,
    500, "P",
    "Sleek, form-fitting body armor for maximum mobility. Radically comfortable.",
    { shortName: "BodySuit 1" },
  ),
  m78_rpa_tshirt: template(
    "m78_rpa_tshirt", "M-78 RPA T-Shirt", "soft", 8, torso,
    120, "C",
    "Consumer-grade light ballistic tee. AP-proof (treat SP as 2/3 when hit with AP).",
    { shortName: "M-78 Tee" },
  ),
  armor_jacket_hood: template(
    "armor_jacket_hood", "Armor Jacket Hood", "soft", 10, head,
    80, "C",
    "Light hood that can be attached to jackets or worn as a hat. Provides head protection without the bulk of a helmet.",
    { shortName: "Armor Hood" },
  ),
  light_armor_pants: template(
    "light_armor_pants", "Light Armor Pants", "soft", 10, legs,
    120, "C",
    "Pants with lightweight Kevlar inserts. Non-restrictive and stylish, with protection for the legs against small arms fire.",
    { shortName: "Lt ArmorPants" },
  ),
  gibson_lvl2: template(
    "gibson_lvl2", "Gibson Form-Fitting Armor Lvl2", "soft", 10, fullWithHead,
    1000, "P",
    "Thicker light armor suit with enhanced protection.",
    { shortName: "BodySuit 2" },
  ),
  kevlar_vest: template(
    "kevlar_vest", "Kevlar T-Shirt/Vest", "soft", 12, torsoArms,
    90, "E",
    "Mostly unnoticeable under street clothes. Will stop most rounds up to a .45 ACP.",
    { shortName: "Kevlar V" },
  ),
  m78_rpa_jacket: template(
    "m78_rpa_jacket", "M-78 RPA Jacket", "soft", 12, torsoArms,
    180, "C",
    "Light armor jacket used by Militech forces. Introduces m-78 AP-proof (treat SP as 2/3 when hit with AP).",
    { shortName: "M-78 Jack" },
  ),
  light_armor_jacket: template(
    "light_armor_jacket", "Light Armor Jacket", "soft", 14, torsoArms,
    150, "C",
    "Personal protection for the fashion conscious. Lightweight Kevlar with nylon covering that could pass as a normal jacket.",
    { shortName: "Lt ArmorJack" },
  ),

  // --- SOFT: MEDIUM (SP 18-20) ---
  med_armor_jacket: template(
    "med_armor_jacket", "Medium Armor Jacket", "soft", 18, torsoArms,
    200, "C",
    "Personal protection for the fashion conscious. Kevlar jacket with nylon covering that resembles a normal jacket.",
    { shortName: "Med ArmorJack", ev: 1 },
  ),
  police_patrol: template(
    "police_patrol", "Police Patrol Armor", "soft", 18, torso,
    250, "P",
    "Standard issue patrol armor for law enforcement.",
    { shortName: "Patrol", ev: 1 },
  ),
  heavy_armor_jacket: template(
    "heavy_armor_jacket", "Heavy Armor Jacket", "soft", 20, torsoArms,
    250, "C",
    "Personal protection for the fashion conscious. Heavy Kevlar jacket with plasteel lamellar inserts. Hot and heavy, strongly associated with street gangs.",
    { shortName: "Hvy ArmorJack", ev: 2 },
  ),

  // --- HARD: LIGHT (SP 14) ---
  steel_helmet: template(
    "steel_helmet", "Steel Helmet", "hard", 14, headFace,
    20, "E",
    "Heavy duty protection for the head, standard for most military. Most have face shields with half the SP.",
    { shortName: "Steel H" },
  ),

  // --- HARD: MEDIUM (SP 18-22) ---
  cballistic_mesh: template(
    "cballistic_mesh", "C-Ballistic Light Mesh", "hard", 18, fullBody,
    500, "P",
    "Lightweight ballistic mesh providing full body coverage.",
    { shortName: "C-Ballistic", ev: 1 },
  ),
  cballistic_mesh_hood: template(
    "cballistic_mesh_hood", "C-Ballistic Mesh Hood", "hard", 18, head,
    300, "P",
    "C-ballistic mesh armor comes with detachable hood providing head coverage.",
    { shortName: "C-Ballistic Hood", ev: 1 },
  ),
  kelmar_class14: template(
    "kelmar_class14", "Kelmar Security Armor Class 14", "hard", 18, fullBody,
    1500, "P",
    "Common standard issue security personnel armor.",
    { shortName: "Kelmar 14", ev: 1 },
  ),
  flak_vest: template(
    "flak_vest", "Flak Vest", "hard", 20, torso,
    200, "C",
    "Standard protection for combat soldiers. Designed to stop small arms fire and grenade shrapnel, but only slow up assault rifle rounds.",
    { shortName: "Flak V", ev: 1 },
  ),
  flak_pants: template(
    "flak_pants", "Flak Pants", "hard", 20, legs,
    200, "C",
    "Standard protection for combat soldiers. Designed to stop small arms fire and grenade shrapnel, but only slow up assault rifle rounds.",
    { shortName: "Flak P", ev: 1 },
  ),
  nylon_helmet: template(
    "nylon_helmet", "Ballistic Nylon Helmet", "hard", 20, headFace,
    100, "C",
    "Heavy duty protection for the head. Made of kevlar and high impact plastics. Most have face shields with half the SP.",
    { shortName: "Nylon H" },
  ),
  police_riot: template(
    "police_riot", "Police Riot Armor", "hard", 22, torso,
    400, "P",
    "Heavy duty riot control armor for law enforcement.",
    { shortName: "Riot", ev: 2 },
  ),
  kelmar_class17: template(
    "kelmar_class17", "Kelmar Security Armor Class 17", "hard", 22, fullBody,
    2500, "R",
    "Upgraded armor for security personnel, with improved protection, materials and design.",
    { shortName: "Kelmar 17", ev: 2 },
  ),

  // --- HARD: HEAVY (SP 25+) ---
  door_gunner_vest: template(
    "door_gunner_vest", "Door Gunner's Vest", "hard", 25, torso,
    250, "P",
    "Heavy duty protection for stationary positions, like machinegun nests, helicopter doors, etc.",
    { shortName: "Door Gunner", ev: 3 },
  ),
  metalgear: template(
    "metalgear", "MetalGear", "hard", 25, allParts,
    600, "P",
    "Laminated expoxide plate armor. Bulky and designed in modular sections: helmet, arm & leg coverings, torso and back clamshell.",
    { ev: 2 },
  ),
  nkvbda: template(
    "nkvbda", "Russian Arms NKVBDA 55", "hard", 26, allParts,
    800, "R",
    "A heavy combat Metal Gear supplied to Eastern European military and police. The helmet comes equipped with short range radio, IR, Anti Dazzle, HUD and enhanced audio pickup.",
    { shortName: "NKVBDA", ev: 3 },
  ),
  corp_mil_armor: template(
    "corp_mil_armor", "Corp Military Body Armor", "hard", 26, fullBody,
    800, "R",
    "Corporate frontline body armor.",
    { shortName: "Corp Mil", ev: 3 },
  ),
};

// =====================
// IMPLANT TEMPLATES (managed separately via body grid, future cyberware system)
// =====================

const skinweaves = (levels: number[]): Record<string, ArmorTemplate> =>
  Object.fromEntries(
    levels.map((sp) => [
      `skinweave_${sp}`,
      template(
        `skinweave_${sp}`, `SkinWeave SP ${sp}`, "soft", sp, allParts,
        sp * 100, "P",
        "Woven armor fibers grown into the skin. Provides uniform protection across the entire body.",
        { shortName: `SW ${sp}`, layer: "skinweave" },
      ),
    ]),
  );

export const IMPLANT_TEMPLATES: Record<string, ArmorTemplate> = {
  ...skinweaves([8, 10, 12, 14]),
  subdermal: template(
    "subdermal", "Subdermal Armor", "soft", 18, torso,
    1200, "P",
    "Armored plastic laminates inserted under the skin for protection.",
    { shortName: "Subdermal", layer: "subdermal" },
  ),
  cowl: template(
    "cowl", "Cowl (Plating)", "hard", 25, head,
    2000, "R",
    "Body plate covering the skull, anchored by minibolts to the scalp.",
    { shortName: "Cowl", layer: "plating" },
  ),
  faceplate: template(
    "faceplate", "Faceplate (Plating)", "hard", 25, ["face"],
    2000, "R",
    "Covers the entire face with ports for breathing, eating and seeing. Woven with myomar muscle fibers for limited expression.",
    { shortName: "Faceplate", layer: "faceplate" },
  ),
  torso_plate: template(
    "torso_plate", "Torso (Plating)", "hard", 25, torso,
    2500, "R",
    "Covers entire upper and lower torso with expansion joints for movement.",
    { shortName: "Torso Plate", layer: "plating", ev: 3 },
  ),
};

// =====================
// Lookup across both catalogs
// =====================

export function getTemplate(templateId: string): ArmorTemplate | null {
  return ARMOR_CATALOG[templateId] ?? IMPLANT_TEMPLATES[templateId] ?? null;
}
