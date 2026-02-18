export interface GearTemplate {
  templateId: string;
  name: string;
  description: string;
  category: string;
  cost?: number;
  availability?: "E" | "C" | "P" | "R" | "U";
}

function t(
  templateId: string,
  name: string,
  category: string,
  description: string,
  opts?: { cost?: number; availability?: "E" | "C" | "P" | "R" | "U" },
): GearTemplate {
  return {
    templateId,
    name,
    description,
    category,
    cost: opts?.cost,
    availability: opts?.availability,
  };
}

export const GEAR_CATALOG: Record<string, GearTemplate> = {
  // === Gadgets ===
  binoculars: t(
    "binoculars",
    "Binoculars",
    "gadgets",
    "Standard 20x magnification. Night-vision models cost extra.",
    { cost: 20, availability: "E" },
  ),
  bug_detector: t(
    "bug_detector",
    "Bug Detector",
    "gadgets",
    "Sweeps a room for listening devices, cameras, and tracers. Range: 3m.",
    { cost: 150, availability: "C" },
  ),
  mini_recorder: t(
    "mini_recorder",
    "Mini-Recorder",
    "gadgets",
    "Thumbnail-sized audio/video recorder. 8hrs continuous recording.",
    { cost: 60, availability: "C" },
  ),
  pocket_computer: t(
    "pocket_computer",
    "Pocket Computer",
    "gadgets",
    "Palmtop with basic apps, wireless link, and limited AI assistant.",
    { cost: 100, availability: "E" },
  ),

  blackbox: t(
    "blackbox",
    "Raven Microcyb Blackbox",
    "gadgets",
    "Military-grade signal interceptor. Cracks encrypted comms in real time. Highly illegal.",
    { cost: 5000, availability: "U" },
  ),

  // === Tools ===
  tech_toolkit: t(
    "tech_toolkit",
    "Tech Toolkit",
    "tools",
    "Comprehensive electronics and mechanical repair kit. Required for TECH skill checks.",
    { cost: 100, availability: "C" },
  ),
  lockpick_set: t(
    "lockpick_set",
    "Lockpick Set",
    "tools",
    "Professional-grade mechanical and electronic lockpick set.",
    { cost: 120, availability: "P" },
  ),
  duct_tape: t(
    "duct_tape",
    "Duct Tape",
    "tools",
    "100m roll. Fixes everything. Temporarily. The street's best friend.",
    { cost: 5, availability: "E" },
  ),
  rope: t(
    "rope",
    "Rope (60m)",
    "tools",
    "Braided nylon climbing rope. Holds up to 200kg.",
    { cost: 15, availability: "E" },
  ),

  // === Consumables ===
  first_aid_kit: t(
    "first_aid_kit",
    "First Aid Kit",
    "consumables",
    "Bandages, synth-skin, painkillers. Enough for 4-6 treatments.",
    { cost: 10, availability: "E" },
  ),
  speedheal: t(
    "speedheal",
    "SpeedHeal",
    "consumables",
    "Nano-accelerated healing dose. Heals 2 wound points over 6 hours. One use.",
    { cost: 50, availability: "C" },
  ),
  flashlight: t(
    "flashlight",
    "Flashlight",
    "consumables",
    "Heavy-duty tactical LED. 50m beam, 48hr battery.",
    { cost: 5, availability: "E" },
  ),

  // === Restraints ===
  handcuffs: t(
    "handcuffs",
    "Handcuffs",
    "restraints",
    "Standard steel restraints. STR 9+ to break.",
    { cost: 20, availability: "C" },
  ),
};

export const GEAR_CATEGORIES = [
  "gadgets",
  "tools",
  "consumables",
  "restraints",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  gadgets: "Gadgets",
  tools: "Tools",
  consumables: "Consumables",
  restraints: "Restraints",
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  E: "Excellent",
  C: "Common",
  P: "Poor",
  R: "Rare",
  U: "Unique",
};
