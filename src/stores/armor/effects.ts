import { persistentAtom } from "@nanostores/persistent";

import type { EVResult } from "@scripts/armor/core";

import { decodeJson } from "../decode";

const DEFAULT: EVResult = { ev: 0, maxLayers: 0, maxLocation: null };

export const $armorEffects = persistentAtom<EVResult>(
  "armor-effects",
  DEFAULT,
  { encode: JSON.stringify, decode: decodeJson(DEFAULT) },
);
