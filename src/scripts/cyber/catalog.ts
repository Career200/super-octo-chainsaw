export type { Availability } from "@scripts/catalog-common";
import type { Availability } from "@scripts/catalog-common";
import type { StatName } from "@scripts/combat/types";

export type CyberCategory =
  | "neuralware"
  | "optics"
  | "bioware"
  | "audio"
  | "implants"
  | "cyberlimbs"
  | "cyberweapons"
  | "fashionware"
  | "cyber-armor";

export const CATEGORY_ORDER: CyberCategory[] = [
  "cyberlimbs",
  "neuralware",
  "optics",
  "bioware",
  "audio",
  "implants",
  "cyberweapons",
  "fashionware",
  "cyber-armor",
];

export const CATEGORY_LABELS: Record<CyberCategory, string> = {
  neuralware: "Neuralware",
  optics: "Optics",
  bioware: "Bioware",
  audio: "Audio",
  implants: "Implants",
  cyberlimbs: "Cyberlimbs",
  cyberweapons: "Cyberweapons",
  fashionware: "Fashionware",
  "cyber-armor": "Armor",
};

export interface CyberTemplate {
  id: string;
  name: string;
  category: CyberCategory;
  description: string;
  role: "container" | "option" | "standalone";
  containerCategory?: string;
  slotCost?: number;
  maxSlots?: number;
  instanceCost?: number;
  hc: string;
  cost?: number;
  availability?: Availability;
  /** Links to an IMPLANT_TEMPLATES entry for cyber-armor items. */
  armorTemplateId?: string;
  /** True for skinweave-type cyber-armor (swaps existing skinweave on install). */
  skinweave?: boolean;
  /** Template IDs of options that come preinstalled with this container. */
  defaultOptions?: string[];
  /** Additive stat bonuses when installed, e.g. { bt: 2 }. Negative = penalty. */
  statBonus?: Partial<Record<StatName, number>>;
  /** Stat value overrides when installed, e.g. { bt: 12 }. */
  statOverride?: Partial<Record<StatName, number>>;
  /** Additive skill bonuses when installed, e.g. { "Resist Torture/Drugs": 2 }. */
  skillBonus?: Record<string, number>;
  /** Additive initiative bonus when installed. */
  initiativeBonus?: number;
  /** Prominent effect text shown in Effects tab (top tier). */
  majorEffect?: string;
  /** Secondary effect text shown in Effects tab (lower tier). */
  minorEffect?: string;
  /** Max installed copies of this template. Default: 1 for standalone (except fashionware), unlimited otherwise. */
  maxInstalled?: number;
}

/** Per-category limit on how many container instance-slots can be owned. */
export const CATEGORY_MAX_INSTANCES: Partial<Record<CyberCategory, number>> = {
  optics: 2,
  audio: 1,
};

export function isDiceNotation(notation: string): boolean {
  return /\d+d\d+/.test(notation.trim());
}

/** Parse and roll dice notation: "2", "0.5", "0", "2d6", "1d6", "1d6/2", "1d6+3". */
export function rollHcDice(notation: string): number {
  const trimmed = notation.trim();

  // dice with optional modifier: "2d6", "1d6/2", "1d6+3", "2d6+4"
  const diceMatch = trimmed.match(/^(\d+)d(\d+)(?:([/+])(\d+))?$/);
  if (diceMatch) {
    const count = parseInt(diceMatch[1], 10);
    const sides = parseInt(diceMatch[2], 10);
    const modOp = diceMatch[3] as "/" | "+" | undefined;
    const modVal = diceMatch[4] ? parseInt(diceMatch[4], 10) : 0;
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    if (modOp === "/") return Math.max(1, Math.round(total / modVal));
    if (modOp === "+") return Math.max(1, total + modVal);
    return Math.max(1, total);
  }

  const flat = parseFloat(trimmed);
  if (!isNaN(flat)) return Math.max(0, flat);

  return 0;
}

function c(
  id: string,
  name: string,
  category: CyberCategory,
  role: CyberTemplate["role"],
  hc: string,
  description: string,
  opts?: {
    cost?: number;
    availability?: Availability;
    containerCategory?: string;
    maxSlots?: number;
    slotCost?: number;
    instanceCost?: number;
    armorTemplateId?: string;
    skinweave?: boolean;
    defaultOptions?: string[];
    statBonus?: Partial<Record<StatName, number>>;
    statOverride?: Partial<Record<StatName, number>>;
    skillBonus?: Record<string, number>;
    initiativeBonus?: number;
    majorEffect?: string;
    minorEffect?: string;
    maxInstalled?: number;
  },
): CyberTemplate {
  return {
    id,
    name,
    category,
    description,
    role,
    hc,
    cost: opts?.cost,
    availability: opts?.availability,
    containerCategory: opts?.containerCategory,
    maxSlots: opts?.maxSlots,
    slotCost: opts?.slotCost,
    instanceCost: opts?.instanceCost,
    armorTemplateId: opts?.armorTemplateId,
    skinweave: opts?.skinweave,
    defaultOptions: opts?.defaultOptions,
    statBonus: opts?.statBonus,
    statOverride: opts?.statOverride,
    skillBonus: opts?.skillBonus,
    initiativeBonus: opts?.initiativeBonus,
    majorEffect: opts?.majorEffect,
    minorEffect: opts?.minorEffect,
    maxInstalled: opts?.maxInstalled,
  };
}

export const CYBER_CATALOG: Record<string, CyberTemplate> = {
  // === Fashionware ===
  techhair: c(
    "techhair",
    "Techhair",
    "fashionware",
    "standalone",
    "2",
    "Color/light emitting artificial hair.",
    { cost: 200, availability: "C" },
  ),
  synthskins: c(
    "synthskins",
    "Synthskins",
    "fashionware",
    "standalone",
    "1d6",
    "Color/pattern changing artificial skin.",
    { cost: 400, availability: "C" },
  ),
  skinwatch: c(
    "skinwatch",
    "Skinwatch",
    "fashionware",
    "standalone",
    "1",
    "Subdermal timepiece.",
    { cost: 50, availability: "C" },
  ),
  "light-tattoo": c(
    "light-tattoo",
    "Light Tattoo",
    "fashionware",
    "standalone",
    "0.5",
    "Decorative tattoo.",
    { cost: 20, availability: "C" },
  ),
  biomonitor: c(
    "biomonitor",
    "Biomonitor",
    "fashionware",
    "standalone",
    "1",
    "Subdermally implanted biofunction monitor.",
    { cost: 100, availability: "C", skillBonus: { "Resist Torture/Drugs": 2 } },
  ),
  chemskins: c(
    "chemskins",
    "ChemSkins",
    "fashionware",
    "standalone",
    "1d6/2",
    "Color/pattern changing skin tints.",
    { cost: 200, availability: "C" },
  ),
  "shift-tacts": c(
    "shift-tacts",
    "Shift-Tacts",
    "fashionware",
    "standalone",
    "0.5",
    "Color changing contact lenses.",
    { cost: 200, availability: "C" },
  ),

  // === Implants ===
  "nasal-filters": c(
    "nasal-filters",
    "Nasal Filters",
    "implants",
    "standalone",
    "2",
    "Stops toxic gases, fumes. 70% effective.",
    { cost: 60, availability: "C", majorEffect: "+4 Saves vs poison/gas/toxins" },
  ),
  "gill-implant": c(
    "gill-implant",
    "Gill Implant",
    "implants",
    "standalone",
    "3d6",
    "Water breathing system, good for 4 hours.",
    { cost: 400, availability: "P", minorEffect: "Water breathing, 4 hours" },
  ),
  "independent-air": c(
    "independent-air",
    "Independent Air Supply",
    "implants",
    "standalone",
    "2d6",
    "Good for 25 minutes.",
    { cost: 300, availability: "P", minorEffect: "25 min independent air" },
  ),
  "mr-studd": c(
    "mr-studd",
    "Mr. Studd Sexual Implant",
    "implants",
    "standalone",
    "2d6",
    "All night, every night. And they say chivalry is dead.",
    { cost: 300, availability: "P", skillBonus: { Seduction: 1 } },
  ),
  contraceptive: c(
    "contraceptive",
    "Contraceptive Implant",
    "implants",
    "standalone",
    "0.5",
    "Good for 5 years. 98% effective.",
    { cost: 100, availability: "C" },
  ),
  "subdermal-pocket": c(
    "subdermal-pocket",
    "Subdermal Pocket",
    "implants",
    "standalone",
    "2d6",
    '2"×4" space with RealSkinn zipper.',
    { cost: 200, availability: "C", minorEffect: "Concealed subdermal storage" },
  ),
  "adrenal-booster": c(
    "adrenal-booster",
    "Adrenal Booster",
    "implants",
    "standalone",
    "2d6",
    "+1 REF for 1d6+2 turns, 3× per day.",
    { cost: 400, availability: "P", majorEffect: "Toggle: +1 REF, 1d6+2 turns, 3×/day" },
  ),
  "motion-detector": c(
    "motion-detector",
    "Motion Detector",
    "implants",
    "standalone",
    "2d6",
    "Detects motion in a 20m² area. 70% effective.",
    { cost: 200, availability: "C", majorEffect: "Motion detect 20m², 70%" },
  ),
  "radar-sensor": c(
    "radar-sensor",
    "Radar Sensor",
    "implants",
    "standalone",
    "2",
    "100m range radar. Requires cyberoptic. 70% effective.",
    { cost: 200, availability: "C", majorEffect: "100m radar, 70%" },
  ),
  "sonar-implant": c(
    "sonar-implant",
    "Sonar Implant",
    "implants",
    "standalone",
    "2",
    "50m range sonar. Water only. 70% effective.",
    { cost: 300, availability: "C", majorEffect: "50m sonar (water), 70%" },
  ),
  "digital-recorder": c(
    "digital-recorder",
    "Digital Recorder",
    "implants",
    "standalone",
    "2",
    "2 hrs storage from any digital source.",
    { cost: 200, availability: "C", minorEffect: "2hr digital recording" },
  ),
  "av-recorder": c(
    "av-recorder",
    "Audio/Video Tape Recorder",
    "implants",
    "standalone",
    "2",
    "2 hrs storage from video, audio links.",
    { cost: 300, availability: "C", minorEffect: "2hr A/V recording" },
  ),
  "radiation-detector": c(
    "radiation-detector",
    "Radiation Detector",
    "implants",
    "standalone",
    "2",
    "10m range. 80% detection effectiveness.",
    { cost: 200, availability: "C", minorEffect: "Radiation detect 10m, 80%" },
  ),
  "chemical-analyser": c(
    "chemical-analyser",
    "Chemical Analyser",
    "implants",
    "standalone",
    "2",
    "5m range. 70% effectiveness.",
    { cost: 200, availability: "C", minorEffect: "Chemical analysis 5m, 70%" },
  ),
  "voice-synthesizer": c(
    "voice-synthesizer",
    "Voice Synthesizer",
    "implants",
    "standalone",
    "1d6",
    "Can mimic any recorded sound (60%), up to 10 sounds.",
    { cost: 600, availability: "C", majorEffect: "+4 Disguise (voice mimicry)" },
  ),
  audiovox: c(
    "audiovox",
    "AudioVox",
    "implants",
    "standalone",
    "2d6",
    "Vocal synthesizer for special effects.",
    { cost: 700, availability: "C", skillBonus: { Performance: 2 } },
  ),
  "wearman-mk2": c(
    "wearman-mk2",
    "Wearman mk2",
    "implants",
    "standalone",
    "0",
    "Stereo music system, implanted version.",
    { cost: 200, availability: "C" },
  ),
  "mediaware-phone": c(
    "mediaware-phone",
    "Mediaware Cellular Phone",
    "implants",
    "standalone",
    "3",
    "Implanted cellular phone for voice communication.",
    { cost: 500, availability: "C" },
  ),
  cyberpillow: c(
    "cyberpillow",
    "CapsuleCo CyberPillow",
    "implants",
    "standalone",
    "0.5",
    "Implanted comfort module for sleeping anywhere.",
    { cost: 80, availability: "C" },
  ),

  // === Bioware ===
  "grafted-muscle": c(
    "grafted-muscle",
    "Grafted Muscle",
    "bioware",
    "standalone",
    "2d6",
    "Up to +2 BOD increase (install once per point).",
    { cost: 1000, availability: "P", statBonus: { bt: 1 }, maxInstalled: 2 },
  ),
  "muscle-bone-lace": c(
    "muscle-bone-lace",
    "Muscle & Bone Lace",
    "bioware",
    "standalone",
    "1d6/2",
    "Raises Body Type by +2.",
    { cost: 1500, availability: "P", statBonus: { bt: 2 } },
  ),
  "enhanced-antibodies": c(
    "enhanced-antibodies",
    "Enhanced Antibodies",
    "bioware",
    "standalone",
    "1d6/2",
    "Improved immune system.",
    { cost: 3000, availability: "R", minorEffect: "+1 healing/day" },
  ),
  "toxin-binders": c(
    "toxin-binders",
    "Toxin Binders",
    "bioware",
    "standalone",
    "1d6/2",
    "Biochemical toxin neutralizers.",
    { cost: 3000, availability: "R", majorEffect: "+4 Poison/Drug Saves" },
  ),
  nanosurgeons: c(
    "nanosurgeons",
    "Nanosurgeons",
    "bioware",
    "standalone",
    "1d6/2",
    "Microscopic surgical robots in the bloodstream.",
    { cost: 6000, availability: "R", minorEffect: "Double healing rate" },
  ),

  // === Optics ===
  "basic-eye": c(
    "basic-eye",
    "Basic Cyberoptic",
    "optics",
    "container",
    "2d6",
    "Cybernetic eye replacement. Add up to 4 options per eye.",
    { cost: 500, availability: "C", maxSlots: 4 },
  ),
  // TODO: add with effects/skills cyber integration
  // Major effect: 180deg. vision, 220deg. peripheral,
  // +1 to initiative in ambushes
  // skill bonus: +1 Awareness/Notice
  "kiroshi-monovision": c(
    "kiroshi-monovision",
    "Kiroshi Monovision",
    "optics",
    "container",
    "3d6",
    "Replace your entire optic ridge and both eyes with a single wide-angle cyberoptic, giving you that cool, visored look so 'in' with today's boosters!",
    { cost: 650, availability: "P", maxSlots: 6, instanceCost: 2 },
  ),
  "color-shift": c(
    "color-shift",
    "Color Shift",
    "optics",
    "option",
    "0.5",
    "Allows color changes, special fashion effects.",
    { cost: 300, availability: "C", containerCategory: "optics" },
  ),
  tsm: c(
    "tsm",
    "Times Square Marquee",
    "optics",
    "option",
    "1",
    "LED screen in vision field for messages.",
    { cost: 300, availability: "C", containerCategory: "optics" },
  ),
  "tsm-plus": c(
    "tsm-plus",
    "Times Square Plus",
    "optics",
    "option",
    "2",
    "Advanced LED screen with full-color video display.",
    { cost: 500, availability: "C", containerCategory: "optics", slotCost: 3 },
  ),

  // === Audio ===
  "basic-hearing": c(
    "basic-hearing",
    "Basic Hearing Module",
    "audio",
    "container",
    "2d6",
    "Cybernetic hearing replacement. No option limit.",
    { cost: 500, availability: "C" },
  ),
  "wearman-audio": c(
    "wearman-audio",
    "Wearman",
    "audio",
    "option",
    "0.5",
    "Stereo music system.",
    { cost: 100, availability: "C", containerCategory: "audio" },
  ),
  "digital-recording-link": c(
    "digital-recording-link",
    "Digital Recording Link",
    "audio",
    "option",
    "0.5",
    "Transmits sounds to a digital recorder.",
    { cost: 100, availability: "C", containerCategory: "audio" },
  ),

  // === Cyber Armor ===
  "cyber-skinweave-6": c(
    "cyber-skinweave-6",
    "SkinWeave SP 6",
    "cyber-armor",
    "standalone",
    "1d6",
    "Woven armor fibers grown into the skin. SP 6 all body parts. Spot difficulty: Impossible (35+).",
    {
      cost: 1000,
      availability: "P",
      armorTemplateId: "skinweave_6",
      skinweave: true,
    },
  ),
  "cyber-skinweave-8": c(
    "cyber-skinweave-8",
    "SkinWeave SP 8",
    "cyber-armor",
    "standalone",
    "1d6+1",
    "Woven armor fibers grown into the skin. SP 8 all body parts. Spot difficulty: Impossible (30).",
    {
      cost: 1250,
      availability: "P",
      armorTemplateId: "skinweave_8",
      skinweave: true,
    },
  ),
  "cyber-skinweave-10": c(
    "cyber-skinweave-10",
    "SkinWeave SP 10",
    "cyber-armor",
    "standalone",
    "1d6+3",
    "Woven armor fibers grown into the skin. SP 10 all body parts. Spot difficulty: Very Difficult (25).",
    {
      cost: 1600,
      availability: "P",
      armorTemplateId: "skinweave_10",
      skinweave: true,
    },
  ),
  "cyber-skinweave-12": c(
    "cyber-skinweave-12",
    "SkinWeave SP 12",
    "cyber-armor",
    "standalone",
    "2d6",
    "Woven armor fibers grown into the skin. SP 12 all body parts. Spot difficulty: Difficult (20). REF -1.",
    {
      cost: 2000,
      availability: "P",
      armorTemplateId: "skinweave_12",
      skinweave: true,
      statBonus: { ref: -1 },
    },
  ),
  "cyber-skinweave-14": c(
    "cyber-skinweave-14",
    "SkinWeave SP 14",
    "cyber-armor",
    "standalone",
    "2d6+2",
    "Woven armor fibers grown into the skin. SP 14 all body parts. Spot difficulty: Difficult (20). REF -2, ATT -1.",
    {
      cost: 2400,
      availability: "P",
      armorTemplateId: "skinweave_14",
      skinweave: true,
      statBonus: { ref: -2, att: -1 },
    },
  ),
  "cyber-skinweave-16": c(
    "cyber-skinweave-16",
    "SkinWeave SP 16",
    "cyber-armor",
    "standalone",
    "2d6+4",
    "Woven armor fibers grown into the skin. SP 16 all body parts. Spot difficulty: Average (15). REF -3, ATT -2.",
    {
      cost: 2750,
      availability: "R",
      armorTemplateId: "skinweave_16",
      skinweave: true,
      statBonus: { ref: -3, att: -2 },
    },
  ),
  "cyber-skin-armor": c(
    "cyber-skin-armor",
    "Skin Armor SP 6",
    "cyber-armor",
    "standalone",
    "0",
    "Bleeding edge designer biotech. SP 6 all body parts. No Humanity Cost. Cannot be spotted.",
    {
      availability: "R",
      armorTemplateId: "skin_armor",
      skinweave: true,
    },
  ),
  "cyber-subdermal": c(
    "cyber-subdermal",
    "Subdermal Armor",
    "cyber-armor",
    "standalone",
    "2d6",
    "Armored plastic laminates inserted under the skin. SP 18, torso only.",
    { cost: 1200, availability: "P", armorTemplateId: "subdermal" },
  ),
  "cyber-cowl": c(
    "cyber-cowl",
    "Cowl",
    "cyber-armor",
    "standalone",
    "1d6",
    "Body plate covering the skull, anchored by minibolts to the scalp. SP 25, head only.",
    { cost: 200, availability: "R", armorTemplateId: "cowl" },
  ),
  "cyber-faceplate": c(
    "cyber-faceplate",
    "Faceplate",
    "cyber-armor",
    "standalone",
    "4d6",
    "Covers the entire face with ports for breathing, eating and seeing. SP 25, face only.",
    { cost: 400, availability: "R", armorTemplateId: "faceplate" },
  ),
  "cyber-torso-plate": c(
    "cyber-torso-plate",
    "Torso Plate",
    "cyber-armor",
    "standalone",
    "3d6",
    "Covers entire upper and lower torso with expansion joints for movement. SP 25, torso only. EV -3.",
    { cost: 2000, availability: "R", armorTemplateId: "torso_plate" },
  ),
};
