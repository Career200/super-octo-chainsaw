import { persistentAtom } from "@nanostores/persistent";

import type { StatName } from "@scripts/combat/types";

import { decodeJson } from "./decode";

export interface CyberEffects {
  humanityLoss: number;
  statBonuses: Partial<Record<StatName, number>>;
  statOverrides: Partial<Record<StatName, number>>;
  skillBonuses: Record<string, number>;
  skillOverrides: Record<string, number>;
  initiativeBonus: number;
  majorEffects: { key: string; text: string }[];
  minorEffects: { key: string; text: string }[];
}

export const DEFAULT_EFFECTS: CyberEffects = {
  humanityLoss: 0,
  statBonuses: {},
  statOverrides: {},
  skillBonuses: {},
  skillOverrides: {},
  initiativeBonus: 0,
  majorEffects: [],
  minorEffects: [],
};

export const $cyberEffects = persistentAtom<CyberEffects>(
  "cyber-effects",
  DEFAULT_EFFECTS,
  {
    encode: JSON.stringify,
    decode: decodeJson(DEFAULT_EFFECTS),
  },
);
