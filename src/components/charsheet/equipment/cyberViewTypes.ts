import type { CyberCategory } from "@scripts/cyber/catalog";
import type { HydratedCyberItem } from "@stores/cyber";

export interface CyberItem {
  id: string;
  name: string;
  category: CyberCategory;
  description: string;
  hc: number | string;
  installed: boolean;
  availability?: string;
  cost?: number;
  isBase?: boolean;
  installedOptions?: string[];
}

export function hydratedToCyberItem(h: HydratedCyberItem): CyberItem {
  return {
    id: h.instanceId,
    name: h.template.name,
    category: h.template.category,
    description: h.template.description,
    hc: h.hc,
    installed: true,
    availability: h.template.availability,
    cost: h.template.cost,
    isBase: h.template.role === "container",
  };
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

export const DEFAULT_LIMBS: CyberlimbCell[] = [
  { slot: "la", label: "L. Arm", isCyber: false, name: "Natural Arm" },
  { slot: "ra", label: "R. Arm", isCyber: false, name: "Natural Arm" },
  { slot: "ll", label: "L. Leg", isCyber: false, name: "Natural Leg" },
  { slot: "rl", label: "R. Leg", isCyber: false, name: "Natural Leg" },
];
