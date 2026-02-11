import { persistentAtom } from "@nanostores/persistent";

export type SpaTab = "biomon" | "rp" | "armor";

export const $spaTab = persistentAtom<SpaTab>("spa-tab", "biomon", {
  encode: JSON.stringify,
  decode: JSON.parse,
});
