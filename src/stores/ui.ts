import { persistentAtom } from "@nanostores/persistent";
import { atom } from "nanostores";

export type SpaTab = "biomon" | "dossier" | "equipment";
export type EquipmentSubTab = "armor" | "gear";

const TAB_MIGRATION: Record<string, SpaTab> = {
  rp: "dossier",
  armor: "equipment",
};

export const $spaTab = persistentAtom<SpaTab>("spa-tab", "biomon", {
  encode: JSON.stringify,
  decode: (raw: string): SpaTab => {
    const v = JSON.parse(raw);
    return TAB_MIGRATION[v] ?? v;
  },
});

export const $equipmentSubTab = persistentAtom<EquipmentSubTab>(
  "equipment-sub-tab",
  "armor",
  { encode: JSON.stringify, decode: (raw: string) => JSON.parse(raw) },
);

/** Currently selected skill name, or null if none selected. */
export const $selectedSkill = atom<string | null>(null);

/** Whether the add-custom-skill form is open. Mutually exclusive with $selectedSkill. */
export const $addingSkill = atom<boolean>(false);

export function selectSkill(name: string | null): void {
  $addingSkill.set(false);
  $selectedSkill.set(name);
}

export function startAddingSkill(): void {
  $selectedSkill.set(null);
  $addingSkill.set(true);
}
