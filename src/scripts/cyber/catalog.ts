export type { Availability } from "@scripts/catalog-common";
import type { Availability } from "@scripts/catalog-common";

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
  hc: string;
  cost?: number;
  availability?: Availability;
}

export function isDiceNotation(notation: string): boolean {
  return /\d+d\d+/.test(notation);
}

/** Parse and roll dice notation: "2", "0.5", "0", "2d6", "1d6", "1d6/2". */
export function rollHcDice(notation: string): number {
  const trimmed = notation.trim();

  // dice with optional divisor: "2d6", "1d6/2"
  const diceMatch = trimmed.match(/^(\d+)d(\d+)(?:\/(\d+))?$/);
  if (diceMatch) {
    const count = parseInt(diceMatch[1], 10);
    const sides = parseInt(diceMatch[2], 10);
    const divisor = diceMatch[3] ? parseInt(diceMatch[3], 10) : 1;
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return Math.max(1, Math.round(total / divisor));
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

  // === Implants ===
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
    { cost: 500, availability: "C", containerCategory: "optics" },
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
};
