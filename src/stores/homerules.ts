import { persistentAtom } from "@nanostores/persistent";

import { decodeJson } from "./decode";

export interface HomerulesState {
  locationalDegradation: boolean;
  scaledDegradation: boolean;
  cyberEyePreinstalled: boolean;
  cyberEyePreinstalledOption: "tsm" | "tsm-plus";
  tsmFreeHc: boolean;
}

const defaults: HomerulesState = {
  locationalDegradation: false,
  scaledDegradation: false,
  cyberEyePreinstalled: true,
  cyberEyePreinstalledOption: "tsm-plus",
  tsmFreeHc: true,
};

export const $homerules = persistentAtom<HomerulesState>(
  "homerules",
  defaults,
  { encode: JSON.stringify, decode: decodeJson(defaults) },
);
