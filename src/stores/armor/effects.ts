import { persistentAtom } from "@nanostores/persistent";

import type { ArmorEffects } from "@scripts/armor/core";

import { decodeJson } from "../decode";

const DEFAULT: ArmorEffects = { ev: 0, maxLayers: 0, maxLocation: null, layersByPart: {} };

export const $armorEffects = persistentAtom<ArmorEffects>(
  "armor-effects",
  DEFAULT,
  { encode: JSON.stringify, decode: decodeJson(DEFAULT) },
);
