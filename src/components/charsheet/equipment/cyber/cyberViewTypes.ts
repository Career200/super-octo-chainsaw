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
