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
  neuralware: 1,
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
    { cost: 700, availability: "C", skillBonus: { Perform: 2 } },
  ),
  "wearman-mk2": c(
    "wearman-mk2",
    "Wearman mk2",
    "implants",
    "standalone",
    "0",
    "Stereo music system, implanted version.",
    { cost: 200, availability: "C", minorEffect: "Implanted stereo music system" },
  ),
  "mediaware-phone": c(
    "mediaware-phone",
    "Mediaware Cellular Phone",
    "implants",
    "standalone",
    "3",
    "Implanted cellular phone for voice communication.",
    { cost: 500, availability: "C", minorEffect: "Implanted cellular phone" },
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
  "kiroshi-monovision": c(
    "kiroshi-monovision",
    "Kiroshi Monovision",
    "optics",
    "container",
    "3d6",
    "Replace your entire optic ridge and both eyes with a single wide-angle cyberoptic, giving you that cool, visored look so 'in' with today's boosters!",
    {
      cost: 650,
      availability: "P",
      maxSlots: 6,
      instanceCost: 2,
      initiativeBonus: 1,
      majorEffect: "+1 Awareness/Notice (sight), 180° vision",
    },
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
  infrared: c(
    "infrared",
    "Infrared",
    "optics",
    "option",
    "1",
    "See heat patterns and thermal signatures. Allows sight in total darkness via heat.",
    { cost: 200, availability: "C", containerCategory: "optics", minorEffect: "Infrared/thermal vision" },
  ),
  "low-lite": c(
    "low-lite",
    "Low Lite\u2122",
    "optics",
    "option",
    "1",
    "Enhanced light amplification. See in near-total darkness (requires some light source).",
    { cost: 200, availability: "C", containerCategory: "optics", minorEffect: "Low-light vision" },
  ),
  "image-enhance": c(
    "image-enhance",
    "Image Enhancement",
    "optics",
    "option",
    "1",
    "Sharpens and clarifies visual data. +2 to Awareness for sight-based perception.",
    { cost: 300, availability: "C", containerCategory: "optics", majorEffect: "+2 Awareness/Notice (sight)" },
  ),
  "targeting-scope": c(
    "targeting-scope",
    "Targeting Scope",
    "optics",
    "option",
    "2",
    "Crosshair display with range-finding. +1 to ranged attacks.",
    { cost: 400, availability: "E", containerCategory: "optics", majorEffect: "+1 ranged attacks" },
  ),
  "anti-dazzle": c(
    "anti-dazzle",
    "Anti-Dazzle",
    "optics",
    "option",
    "1",
    "Automatic polarization filter. Immunity to flash and dazzle effects.",
    { cost: 200, availability: "C", containerCategory: "optics", majorEffect: "Immune to flash/dazzle" },
  ),
  "micro-optics": c(
    "micro-optics",
    "Micro-Optics",
    "optics",
    "option",
    "1",
    "Microscopic magnification (up to 400\u00D7). Useful for electronics work, forgery, and medical tasks.",
    { cost: 150, availability: "C", containerCategory: "optics", minorEffect: "400\u00D7 magnification" },
  ),
  dartgun: c(
    "dartgun",
    "Dartgun",
    "optics",
    "option",
    "2",
    "Concealed single-shot dartgun in cyberoptic. 1 meter range, poison/drug dart. 1P damage.",
    { cost: 200, availability: "P", containerCategory: "optics", slotCost: 2, majorEffect: "Concealed dartgun (1m, 1P, drug/poison)" },
  ),
  teleoptics: c(
    "teleoptics",
    "Teleoptics",
    "optics",
    "option",
    "1",
    "Telescopic vision up to 800m. Can ID faces at 400m.",
    { cost: 150, availability: "C", containerCategory: "optics", minorEffect: "Telescopic vision 800m" },
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
    { cost: 100, availability: "C", containerCategory: "audio", minorEffect: "Stereo music playback" },
  ),
  "digital-recording-link": c(
    "digital-recording-link",
    "Digital Recording Link",
    "audio",
    "option",
    "0.5",
    "Transmits sounds to a digital recorder.",
    { cost: 100, availability: "C", containerCategory: "audio", minorEffect: "Transmit audio to recorder" },
  ),
  "amplified-hearing": c(
    "amplified-hearing",
    "Amplified Hearing",
    "audio",
    "option",
    "1",
    "Enhanced audio sensitivity. +1 to Awareness for hearing-based perception.",
    { cost: 150, availability: "C", containerCategory: "audio", majorEffect: "+1 Awareness/Notice (hearing)" },
  ),
  "radio-link": c(
    "radio-link",
    "Radio Link",
    "audio",
    "option",
    "0.5",
    "Internal radio transceiver with 1 mile range. Encrypted channel.",
    { cost: 100, availability: "C", containerCategory: "audio", minorEffect: "1mi radio transceiver" },
  ),
  "phone-splice": c(
    "phone-splice",
    "Phone Splice",
    "audio",
    "option",
    "0.5",
    "Allows direct phone calls through cyberaudio. Rings in your head.",
    { cost: 150, availability: "C", containerCategory: "audio", minorEffect: "Internal phone" },
  ),
  scrambler: c(
    "scrambler",
    "Scrambler/Descrambler",
    "audio",
    "option",
    "0.5",
    "Encrypts and decrypts audio transmissions.",
    { cost: 100, availability: "C", containerCategory: "audio", minorEffect: "Audio encryption/decryption" },
  ),
  "bug-detector": c(
    "bug-detector",
    "Bug Detector",
    "audio",
    "option",
    "1",
    "Detects surveillance devices (bugs, taps) within 6m. 60% base effectiveness.",
    { cost: 200, availability: "E", containerCategory: "audio", majorEffect: "Bug detect 6m, 60%" },
  ),
  "voice-stress-analyzer": c(
    "voice-stress-analyzer",
    "Voice Stress Analyzer",
    "audio",
    "option",
    "1",
    "Detects stress patterns in speech. +2 Human Perception for lie detection.",
    { cost: 200, availability: "E", containerCategory: "audio", majorEffect: "+2 Human Perception (lie detection)" },
  ),
  "sound-editing": c(
    "sound-editing",
    "Sound Editing",
    "audio",
    "option",
    "0.5",
    "Filter, enhance, and edit sounds in real-time. Isolate specific sounds from background noise.",
    { cost: 150, availability: "C", containerCategory: "audio", minorEffect: "Real-time sound editing" },
  ),
  "enhanced-hearing-range": c(
    "enhanced-hearing-range",
    "Enhanced Hearing Range",
    "audio",
    "option",
    "1",
    "Extends hearing range into ultra/subsonic frequencies.",
    { cost: 150, availability: "C", containerCategory: "audio", minorEffect: "Ultra/subsonic hearing" },
  ),
  "level-dampener": c(
    "level-dampener",
    "Level Dampener",
    "audio",
    "option",
    "0.5",
    "Automatic sound level adjustment. Protects against loud sounds, sonic attacks, and flashbangs (audio component).",
    { cost: 200, availability: "C", containerCategory: "audio", majorEffect: "Immune to sonic stun/deafening" },
  ),
  "radar-detector-audio": c(
    "radar-detector-audio",
    "Radar Detector",
    "audio",
    "option",
    "1",
    "Detects radar emissions directed at you. 50% effectiveness.",
    { cost: 200, availability: "E", containerCategory: "audio", minorEffect: "Radar emission detect, 50%" },
  ),
  "homing-tracer": c(
    "homing-tracer",
    "Homing Tracer",
    "audio",
    "option",
    "0.5",
    "Track a planted homing beacon via cyberaudio. 1km range.",
    { cost: 200, availability: "E", containerCategory: "audio", minorEffect: "Homing beacon tracking 1km" },
  ),
  "tight-beam-radio": c(
    "tight-beam-radio",
    "Tight Beam Radio Link",
    "audio",
    "option",
    "0.5",
    "Directional radio link. Harder to intercept than standard radio. 1 mile range.",
    { cost: 100, availability: "C", containerCategory: "audio", minorEffect: "Secure directional radio 1mi" },
  ),
  "wide-band-scanner": c(
    "wide-band-scanner",
    "Wide Band Radio Scanner",
    "audio",
    "option",
    "1",
    "Scan and monitor all radio frequencies in range. Can eavesdrop on open channels.",
    { cost: 100, availability: "C", containerCategory: "audio", minorEffect: "Wide-band radio scanning" },
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

  // === Neuralware ===
  "neural-processor": c(
    "neural-processor",
    "Neural Processor",
    "neuralware",
    "container",
    "1d6",
    "Artificial neural sub-brain with its own memory and co-processors. Required for all neuralware options.",
    { cost: 1000, availability: "C", majorEffect: "Required for all neuralware" },
  ),
  "interface-plugs": c(
    "interface-plugs",
    "Interface Plugs",
    "neuralware",
    "option",
    "1d6",
    "Plugs in the wrist for direct machine interface. Required for vehicle links, smartgun links, and decking.",
    { cost: 200, availability: "C", containerCategory: "neuralware", minorEffect: "Direct machine interface via plugs" },
  ),
  "chipware-socket": c(
    "chipware-socket",
    "Chipware Socket",
    "neuralware",
    "option",
    "1d6/2",
    "Slots for APTR skillchips, language chips, and other chipware. Accepts standard Dataflex chips.",
    { cost: 200, availability: "C", containerCategory: "neuralware", minorEffect: "Chipware slot for skillchips" },
  ),
  "smartgun-link": c(
    "smartgun-link",
    "Smartgun Link",
    "neuralware",
    "option",
    "2",
    "Direct neural interface to a smartchipped weapon. Provides targeting data overlay. Requires interface plugs.",
    { cost: 100, availability: "C", containerCategory: "neuralware", majorEffect: "+2 Handgun/SMG/Rifle w/ smartchipped weapon" },
  ),
  "vehicle-link": c(
    "vehicle-link",
    "Vehicle Link",
    "neuralware",
    "option",
    "3",
    "Direct neural control of a vehicle. Requires interface plugs.",
    { cost: 100, availability: "C", containerCategory: "neuralware", minorEffect: "Neural vehicle control" },
  ),
  "machine-tech-link": c(
    "machine-tech-link",
    "Machine/Tech Link",
    "neuralware",
    "option",
    "2",
    "Direct neural link for tech/machine operations. Requires interface plugs.",
    { cost: 100, availability: "C", containerCategory: "neuralware", majorEffect: "+2 CyberTech/Electronics/Basic Tech when linked" },
  ),
  "dataterm-link": c(
    "dataterm-link",
    "DataTerm Link",
    "neuralware",
    "option",
    "1",
    "Direct neural interface to public DataTerm net for information access.",
    { cost: 100, availability: "C", containerCategory: "neuralware", minorEffect: "DataTerm net access" },
  ),
  "kerenzikov-lv1": c(
    "kerenzikov-lv1",
    "Kerenzikov Booster Lv.1",
    "neuralware",
    "option",
    "1",
    "Enhanced reflex co-processor. +1 initiative.",
    { cost: 500, availability: "E", containerCategory: "neuralware", initiativeBonus: 1 },
  ),
  "kerenzikov-lv2": c(
    "kerenzikov-lv2",
    "Kerenzikov Booster Lv.2",
    "neuralware",
    "option",
    "2",
    "Advanced reflex co-processor. +2 initiative.",
    { cost: 1000, availability: "P", containerCategory: "neuralware", initiativeBonus: 2 },
  ),
  "sandevistan-boost": c(
    "sandevistan-boost",
    "Sandevistan Speedware",
    "neuralware",
    "option",
    "1d6",
    "Adrenaline-boosted speed enhancement. +3 initiative for one turn, usable once per day.",
    { cost: 1600, availability: "R", containerCategory: "neuralware", majorEffect: "Toggle: +3 Initiative, 1 turn, 1\u00D7/day" },
  ),
  "tactile-boost": c(
    "tactile-boost",
    "Tactile Boost",
    "neuralware",
    "option",
    "2",
    "Enhanced tactile sensitivity. Allows detection by touch at +2.",
    { cost: 100, availability: "C", containerCategory: "neuralware", majorEffect: "+2 Awareness/Notice (touch)" },
  ),
  "olfactory-boost": c(
    "olfactory-boost",
    "Olfactory Boost",
    "neuralware",
    "option",
    "2",
    "Enhanced sense of smell. Allows scent-based detection at +2.",
    { cost: 100, availability: "C", containerCategory: "neuralware", majorEffect: "+2 Awareness/Notice (scent)" },
  ),

  // === Cyberweapons ===
  scratchers: c(
    "scratchers",
    "Scratchers",
    "cyberweapons",
    "standalone",
    "2d6",
    "Carbo-glass fingernails. Hardened, razor-edged. 1d6 damage. Concealable.",
    { cost: 100, availability: "C", majorEffect: "Melee: 1d6 AP, concealable" },
  ),
  vampires: c(
    "vampires",
    "Vampires",
    "cyberweapons",
    "standalone",
    "3d6",
    "Cybermetallic fangs with tiny drug injectors. 1d6 damage + drug/poison delivery.",
    { cost: 200, availability: "P", majorEffect: "Melee: 1d6 + drug/poison bite" },
  ),
  rippers: c(
    "rippers",
    "Rippers",
    "cyberweapons",
    "standalone",
    "3d6",
    "Carboglass or metal claws extending from the fingertips. 2d6 damage. Very Difficult to conceal.",
    { cost: 400, availability: "P", majorEffect: "Melee: 2d6 claws" },
  ),
  wolvers: c(
    "wolvers",
    "Wolvers",
    "cyberweapons",
    "standalone",
    "3d6+1",
    'Heavy, reinforced claws that extend from the back of the hand (3" length). 3d6 damage. Cannot be concealed.',
    { cost: 600, availability: "R", majorEffect: "Melee: 3d6 claws, not concealable" },
  ),
  "big-knucks": c(
    "big-knucks",
    "Big Knucks",
    "cyberweapons",
    "standalone",
    "3d6",
    "Armored knuckle implants with reinforced bone structure. 1d6+2 damage.",
    { cost: 500, availability: "P", majorEffect: "Melee: 1d6+2 armored fist" },
  ),
  "slice-n-dice": c(
    "slice-n-dice",
    "Slice 'N' Dice",
    "cyberweapons",
    "standalone",
    "3d6+1",
    "Monofilament whip implanted in the finger. 4ft range. 2d6 damage. Can be concealed in finger.",
    { cost: 700, availability: "R", majorEffect: "Melee: 2d6 monowhip, 4ft reach" },
  ),
  cybersnake: c(
    "cybersnake",
    "Cybersnake",
    "cyberweapons",
    "standalone",
    "2d6",
    'Articulated metal snake (24"), hidden in throat. Bite attack with drug/poison delivery, or mount small gun/camera.',
    { cost: 1200, availability: "R", majorEffect: "Throat-mounted cybersnake, poison/weapon" },
  ),

  // === Cyberlimbs ===
  "standard-arm": c(
    "standard-arm",
    "Standard Cybernetic Arm",
    "cyberlimbs",
    "container",
    "2d6",
    "Full replacement cybernetic arm. SDP 20. Can mount options. BOD-equivalent STR for that arm.",
    { cost: 2000, availability: "C", maxSlots: 4 },
  ),
  "standard-leg": c(
    "standard-leg",
    "Standard Cybernetic Leg",
    "cyberlimbs",
    "container",
    "2d6",
    "Full replacement cybernetic leg. SDP 20. Can mount options. +4 to leap distance.",
    { cost: 2000, availability: "C", maxSlots: 3, minorEffect: "+4 leap distance" },
  ),
  "superchrome-cover": c(
    "superchrome-cover",
    "SuperChrome Cover",
    "cyberlimbs",
    "option",
    "1d6+1",
    "Flashy chromed covering for a cyberlimb. Highly visible, very fashionable.",
    { cost: 200, availability: "C", containerCategory: "cyberlimbs" },
  ),
  "hydraulic-rams": c(
    "hydraulic-rams",
    "Hydraulic Rams",
    "cyberlimbs",
    "option",
    "3",
    "Hydraulic power boosters for a cyberlimb. +3 damage in crushing grip, +2 to Feats of Strength with that limb.",
    { cost: 200, availability: "P", containerCategory: "cyberlimbs", majorEffect: "+3 crush damage, +2 STR feats (limb)" },
  ),
  "thickened-myomar": c(
    "thickened-myomar",
    "Thickened Myomar Strands",
    "cyberlimbs",
    "option",
    "2",
    "Enhanced artificial muscle fiber. +2 damage for melee attacks with this limb.",
    { cost: 250, availability: "P", containerCategory: "cyberlimbs", majorEffect: "+2 melee damage (limb)" },
  ),
  "quick-change-mount": c(
    "quick-change-mount",
    "Quick Change Mount",
    "cyberlimbs",
    "option",
    "2",
    "Allows the cyberlimb hand to be swapped for a tool, weapon, or alternate hand in one action.",
    { cost: 200, availability: "C", containerCategory: "cyberlimbs", minorEffect: "Hot-swap hand/tool mount" },
  ),
  "tool-hand": c(
    "tool-hand",
    "Tool Hand",
    "cyberlimbs",
    "option",
    "2",
    "Hand replaced with built-in tool set (screwdriver, wrench, soldering iron, etc.). +2 to relevant tech tasks.",
    { cost: 200, availability: "C", containerCategory: "cyberlimbs", majorEffect: "+2 Basic Tech (tool hand)" },
  ),
  "buzz-hand": c(
    "buzz-hand",
    "Buzz Hand",
    "cyberlimbs",
    "option",
    "2",
    "Hand replaced with high-speed circular saw. 2d6 damage in melee. Not subtle.",
    { cost: 300, availability: "P", containerCategory: "cyberlimbs", majorEffect: "Melee: 2d6 buzzsaw hand" },
  ),
};
