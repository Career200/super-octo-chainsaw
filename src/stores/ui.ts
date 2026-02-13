import { persistentAtom } from "@nanostores/persistent";
import { atom } from "nanostores";

export type SpaTab = "biomon" | "rp" | "armor";

export const $spaTab = persistentAtom<SpaTab>("spa-tab", "biomon", {
  encode: JSON.stringify,
  decode: JSON.parse,
});

/** Currently selected skill name, or null if none selected. */
export const $selectedSkill = atom<string | null>(null);
