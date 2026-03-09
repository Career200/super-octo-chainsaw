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

export interface CyberItem {
  id: string;
  name: string;
  category: CyberCategory;
  description: string;
  hc: number;
  installed: boolean;
  availability?: string;
  cost?: number;
  isBase?: boolean;
  installedOptions?: string[];
}

export interface CyberlimbCell {
  slot: "la" | "ra" | "ll" | "rl";
  label: string;
  isCyber: boolean;
  name: string;
  sdpCurrent?: number;
  sdpMax?: number;
  hc?: number;
  availability?: string;
  cost?: number;
}

export interface LimbOption {
  id: string;
  name: string;
  description: string;
  hc: number;
  availability?: string;
  cost?: number;
}

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

// --- Mock installed items ---

export const MOCK_INSTALLED: CyberItem[] = [
  // Neuralware (container: processor + options)
  {
    id: "nw-proc",
    name: "Neural Processor",
    category: "neuralware",
    description: "Required base for all neuralware options.",
    hc: 4,
    installed: true,
    availability: "C",
    cost: 1000,
    isBase: true,
  },
  {
    id: "nw-ker",
    name: "Kerenzikov Boost",
    category: "neuralware",
    description: "+1 Initiative (always on).",
    hc: 5,
    installed: true,
    availability: "P",
    cost: 500,
  },
  {
    id: "nw-smart",
    name: "Smartgun Link",
    category: "neuralware",
    description: "Links to smartchipped weapons for +2 WA.",
    hc: 4,
    installed: true,
    availability: "C",
    cost: 100,
  },
  // Bioware
  {
    id: "bio-skin",
    name: "Skinwatch",
    category: "bioware",
    description: "Subdermal time display.",
    hc: 1,
    installed: true,
    availability: "E",
    cost: 50,
  },
  {
    id: "bio-nasal",
    name: "Nasal Filters",
    category: "bioware",
    description: "+4 saves vs inhaled toxins.",
    hc: 3,
    installed: true,
    availability: "C",
    cost: 200,
  },
  // Implants
  {
    id: "imp-pocket",
    name: "Subdermal Pocket",
    category: "implants",
    description: "Hidden compartment under the skin.",
    hc: 3,
    installed: true,
    availability: "P",
    cost: 200,
  },
  {
    id: "imp-adrenal",
    name: "Adrenal Booster",
    category: "implants",
    description: "Temporary +1 REF for 1d6+2 turns.",
    hc: 5,
    installed: true,
    availability: "R",
    cost: 400,
  },
];

// --- Mock cyberlimbs ---

export const MOCK_LIMBS: CyberlimbCell[] = [
  { slot: "la", label: "L. Arm", isCyber: false, name: "Natural Arm" },
  {
    slot: "ra",
    label: "R. Arm",
    isCyber: true,
    name: "Cyberarm",
    sdpCurrent: 14,
    sdpMax: 20,
    hc: 7,
    availability: "C",
    cost: 500,
  },
  {
    slot: "ll",
    label: "L. Leg",
    isCyber: true,
    name: "Cyberleg",
    sdpCurrent: 20,
    sdpMax: 20,
    hc: 7,
    availability: "C",
    cost: 500,
  },
  {
    slot: "rl",
    label: "R. Leg",
    isCyber: true,
    name: "Cyberleg",
    sdpCurrent: 20,
    sdpMax: 20,
    hc: 7,
    availability: "C",
    cost: 500,
  },
];

// --- Limb options (installed per slot) ---

export const MOCK_LIMB_OPTIONS: Record<CyberlimbCell["slot"], LimbOption[]> = {
  la: [],
  ra: [
    {
      id: "opt-myomar-ra",
      name: "Thickened Myomar",
      description: "+5 SDP, x2 crush/punch/kick damage, +50% jump distance.",
      hc: 3,
      availability: "P",
      cost: 500,
    },
  ],
  ll: [],
  rl: [],
};

// --- Limb option catalog (available for any cyber limb) ---

export const MOCK_LIMB_OPTION_CATALOG: LimbOption[] = [
  {
    id: "cat-myomar",
    name: "Thickened Myomar",
    description: "+5 SDP, x2 crush/punch/kick damage, +50% jump distance.",
    hc: 3,
    availability: "P",
    cost: 500,
  },
  {
    id: "cat-hydraulic",
    name: "Hydraulic Rams",
    description:
      "+3 crushing damage. Mutually exclusive with Thickened Myomar.",
    hc: 3,
    availability: "P",
    cost: 600,
  },
  {
    id: "cat-quickchange",
    name: "Quick-Change Mount",
    description: "Swap hand/foot attachment in 1 action.",
    hc: 2,
    availability: "C",
    cost: 200,
  },
];

// --- Limb replacement catalog ---

type LimbType = "arm" | "leg";

export const MOCK_CYBER_REPLACEMENTS: Record<LimbType, LimbOption> = {
  arm: {
    id: "cat-cyberarm",
    name: "Standard Cyberarm",
    description: "Cyberlimb arm replacement. SDP 20, 4 option slots.",
    hc: 7,
    availability: "C",
    cost: 500,
  },
  leg: {
    id: "cat-cyberleg",
    name: "Standard Cyberleg",
    description: "Cyberlimb leg replacement. SDP 20, 4 option slots.",
    hc: 7,
    availability: "C",
    cost: 500,
  },
};

export const MOCK_MEAT_REPLACEMENTS: Record<LimbType, LimbOption> = {
  arm: {
    id: "cat-meat-arm",
    name: "Natural Arm",
    description: "Restore natural limb. Removes all installed options.",
    hc: 0,
    availability: "R",
    cost: 3000,
  },
  leg: {
    id: "cat-meat-leg",
    name: "Natural Leg",
    description: "Restore natural limb. Removes all installed options.",
    hc: 0,
    availability: "R",
    cost: 3000,
  },
};

// --- Mock HC/EMP ---

export const MOCK_HC = {
  humanity: 31,
  hcTotal: 69,
  empBase: 10,
  empCurrent: 4,
};

// --- Mock catalog (superset of installed, per-category) ---

export const MOCK_CATALOG: Record<CyberCategory, CyberItem[]> = {
  neuralware: [
    ...MOCK_INSTALLED.filter((i) => i.category === "neuralware"),
    {
      id: "nw-tactile",
      name: "Tactile Boost",
      category: "neuralware",
      description: "+2 Awareness (touch).",
      hc: 5,
      installed: false,
      availability: "C",
      cost: 100,
    },
  ],
  bioware: [
    ...MOCK_INSTALLED.filter((i) => i.category === "bioware"),
    {
      id: "bio-toxin",
      name: "Toxin Binders",
      category: "bioware",
      description: "+2 saves vs all toxins.",
      hc: 3,
      installed: false,
      availability: "C",
      cost: 300,
    },
    {
      id: "bio-gills",
      name: "Gills",
      category: "bioware",
      description: "Underwater breathing.",
      hc: 6,
      installed: false,
      availability: "P",
      cost: 400,
    },
  ],
  implants: [
    ...MOCK_INSTALLED.filter((i) => i.category === "implants"),
    {
      id: "imp-studd",
      name: "Mr. Studd",
      category: "implants",
      description: "All night, every night.",
      hc: 2,
      installed: false,
      availability: "E",
      cost: 300,
    },
  ],
  optics: [],
  audio: [],
  cyberlimbs: [],
  cyberweapons: [],
  fashionware: [],
  "cyber-armor": [],
};

// --- Helper: LimbOption → CyberItem ---

const limbOptToItem = (opt: LimbOption, installed: boolean): CyberItem => ({
  id: opt.id,
  name: opt.name,
  category: "cyberlimbs",
  description: opt.description,
  hc: opt.hc,
  installed,
  availability: opt.availability,
  cost: opt.cost,
});

// --- Merged flat list for bottom bar lookups ---

export const MOCK_ALL_ITEMS: CyberItem[] = [
  ...MOCK_INSTALLED,
  ...Object.values(MOCK_CATALOG)
    .flat()
    .filter((item) => !MOCK_INSTALLED.some((i) => i.id === item.id)),
  // Synthetic limb items (the limbs themselves)
  ...MOCK_LIMBS.map(
    (limb): CyberItem => ({
      id: `limb-${limb.slot}`,
      name: limb.name,
      category: "cyberlimbs",
      description: limb.isCyber
        ? `SDP: ${limb.sdpCurrent}/${limb.sdpMax}`
        : "Natural limb",
      hc: limb.hc ?? 0,
      installed: limb.isCyber,
      availability: limb.availability,
      cost: limb.cost,
    }),
  ),
  // Installed limb options
  ...Object.values(MOCK_LIMB_OPTIONS)
    .flat()
    .map((opt) => limbOptToItem(opt, true)),
  // Limb option catalog
  ...MOCK_LIMB_OPTION_CATALOG.map((opt) => limbOptToItem(opt, false)),
  // Limb replacements
  ...Object.values(MOCK_CYBER_REPLACEMENTS).map((opt) =>
    limbOptToItem(opt, false),
  ),
  ...Object.values(MOCK_MEAT_REPLACEMENTS).map((opt) =>
    limbOptToItem(opt, false),
  ),
];
