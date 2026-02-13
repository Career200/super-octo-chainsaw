import type { StatName } from "@scripts/biomon/types";

export type SkillStat = StatName | "special";

export interface SkillDefinition {
  stat: SkillStat;
  combat: boolean;
  description?: string;
}

export const SKILL_CATALOG: Record<string, SkillDefinition> = {
  // Special abilities (one per role)
  Authority: { stat: "special", combat: false },
  "Charismatic Leadership": { stat: "special", combat: false },
  "Combat Sense": { stat: "special", combat: false },
  Credibility: { stat: "special", combat: false },
  Family: { stat: "special", combat: false },
  Interface: { stat: "special", combat: false },
  "Jury Rig": { stat: "special", combat: false },
  "Medical Tech": { stat: "special", combat: false },
  Resources: { stat: "special", combat: false },
  Streetdeal: { stat: "special", combat: false },

  // ATT
  "Personal Grooming": { stat: "att", combat: false },
  "Wardrobe & Style": { stat: "att", combat: false },

  // BT (body)
  Endurance: { stat: "bt", combat: false },
  "Strength Feat": { stat: "bt", combat: false },
  Swimming: { stat: "bt", combat: false },

  // CL (cool/will)
  Interrogation: { stat: "cl", combat: false },
  Intimidate: { stat: "cl", combat: false },
  Oratory: { stat: "cl", combat: false },
  "Resist Torture/Drugs": { stat: "cl", combat: false },
  Streetwise: { stat: "cl", combat: false, description: "Knowledge of the street — who to talk to, where to score, how to survive.\n2 — you know your neighborhood.\n6 — you have contacts across the city.\n9 — fixers come to you." },

  // EMP
  "Human Perception": { stat: "emp", combat: false },
  Interview: { stat: "emp", combat: false },
  Leadership: { stat: "emp", combat: false },
  Seduction: { stat: "emp", combat: false },
  Social: { stat: "emp", combat: false },
  "Persuasion & Fast Talk": { stat: "emp", combat: false },
  Perform: { stat: "emp", combat: false },

  // INT
  Accounting: { stat: "int", combat: false },
  Anthropology: { stat: "int", combat: false },
  "Awareness/Notice": { stat: "int", combat: false, description: "General awareness and ability to notice things.\n2 — you spot the obvious.\n6 — you catch a tail in a crowd.\n9 — nothing escapes you, ever." },
  Biology: { stat: "int", combat: false },
  Botany: { stat: "int", combat: false },
  Chemistry: { stat: "int", combat: false },
  Composition: { stat: "int", combat: false },
  "Diagnose Illness": { stat: "int", combat: false },
  "Education & General Knowledge": { stat: "int", combat: false },
  Expert: { stat: "int", combat: false },
  Gamble: { stat: "int", combat: false },
  Geology: { stat: "int", combat: false },
  "Hide/Evade": { stat: "int", combat: false },
  History: { stat: "int", combat: false },
  "Know Language": { stat: "int", combat: false },
  "Library Search": { stat: "int", combat: false },
  Mathematics: { stat: "int", combat: false },
  Physics: { stat: "int", combat: false },
  Programming: { stat: "int", combat: false },
  "Shadow/Track": { stat: "int", combat: false },
  "Stock Market": { stat: "int", combat: false },
  "System Knowledge": { stat: "int", combat: false },
  Teaching: { stat: "int", combat: false },
  "Wilderness Survival": { stat: "int", combat: false },
  Zoology: { stat: "int", combat: false },

  // REF
  Archery: { stat: "ref", combat: true },
  Athletics: { stat: "ref", combat: true },
  Brawling: { stat: "ref", combat: true, description: "Unarmed fighting — punches, kicks, headbutts, dirty tricks.\n2 — bar fighter.\n6 — you win street fights reliably.\n9 — bare-knuckle legend." },
  Dance: { stat: "ref", combat: false },
  "Dodge & Escape": { stat: "ref", combat: true },
  Driving: { stat: "ref", combat: false },
  Fencing: { stat: "ref", combat: true },
  Handgun: { stat: "ref", combat: true, description: "Accuracy and handling of pistols and revolvers.\n2 — you hit the target at the range, usually.\n6 — quick-draw artist, reliable under pressure.\n9 — you shoot coins out of the air." },
  "Heavy Weapons": { stat: "ref", combat: true },
  "Martial Arts": { stat: "ref", combat: true },
  Melee: { stat: "ref", combat: true },
  Motorcycle: { stat: "ref", combat: false },
  "Operate Heavy Machinery": { stat: "ref", combat: false },
  Pilot: { stat: "ref", combat: false },
  "Pilot (Gyro)": { stat: "ref", combat: false },
  "Pilot (Fixed Wing)": { stat: "ref", combat: false },
  "Pilot (Dirigible)": { stat: "ref", combat: false },
  "Pilot (Vect. Trust Vehicle)": { stat: "ref", combat: false },
  Rifle: { stat: "ref", combat: true },
  Stealth: { stat: "ref", combat: false },
  Submachinegun: { stat: "ref", combat: true },

  // TECH
  "Aero Tech": { stat: "tech", combat: false },
  "AV Tech": { stat: "tech", combat: false },
  "Basic Tech": { stat: "tech", combat: false },
  "Cryotank Operation": { stat: "tech", combat: false },
  "Cyberdeck Design": { stat: "tech", combat: false },
  CyberTech: { stat: "tech", combat: false },
  Demolitions: { stat: "tech", combat: false },
  Disguise: { stat: "tech", combat: false },
  Electronics: { stat: "tech", combat: false },
  "Electronic Security": { stat: "tech", combat: false },
  "First Aid": { stat: "tech", combat: false, description: "Emergency medical treatment in the field.\n2 — you can apply a bandage.\n6 — you stabilize gunshot wounds.\n9 — battlefield surgeon, no table needed." },
  Forgery: { stat: "tech", combat: false },
  "Gyro Tech": { stat: "tech", combat: false },
  "Paint or Draw": { stat: "tech", combat: false },
  "Photo & Film": { stat: "tech", combat: false },
  Pharmaceuticals: { stat: "tech", combat: false },
  "Pick Lock": { stat: "tech", combat: false },
  "Pick Pocket": { stat: "tech", combat: false },
  "Play Instrument": { stat: "tech", combat: false },
  Weaponsmith: { stat: "tech", combat: false },
};

/** Display order for the biomon combat panel, maybe broken down to melee/ranged? Not relevant right now though */
export const COMBAT_SKILLS_ORDER: string[] = [
  "Handgun",
  "Rifle",
  "Submachinegun",
  "Heavy Weapons",
  "Melee",
  "Brawling",
  "Fencing",
  "Martial Arts",
  "Archery",
  "Dodge & Escape",
  "Athletics",
];

/** Name constants for computed stores */
export const AWARENESS_SKILL = "Awareness/Notice";
export const COMBAT_SENSE_SKILL = "Combat Sense";
