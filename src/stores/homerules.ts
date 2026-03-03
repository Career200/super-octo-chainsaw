import { persistentAtom } from "@nanostores/persistent";

import { decodeJson } from "./decode";

export interface HomerulesState {
  locationalDegradation: boolean;
  scaledDegradation: boolean;
}

const defaults: HomerulesState = {
  locationalDegradation: false,
  scaledDegradation: false,
};

export const $homerules = persistentAtom<HomerulesState>(
  "homerules",
  defaults,
  { encode: JSON.stringify, decode: decodeJson(defaults) },
);
