import { persistentAtom } from "@nanostores/persistent";
import { atom } from "nanostores";

export type SpaTab = "biomon" | "dossier" | "equipment";
export type EquipmentSubTab = "armor" | "gear";

const TAB_MIGRATION: Record<string, SpaTab> = {
  rp: "dossier",
  armor: "equipment",
};

const VALID_SPA_TABS: SpaTab[] = ["biomon", "dossier", "equipment"];
const VALID_EQUIPMENT_TABS: EquipmentSubTab[] = ["armor", "gear"];

export const $spaTab = persistentAtom<SpaTab>("spa-tab", "biomon", {
  encode: JSON.stringify,
  decode: (raw: string): SpaTab => {
    try {
      const v = JSON.parse(raw);
      const migrated = TAB_MIGRATION[v] ?? v;
      return VALID_SPA_TABS.includes(migrated) ? migrated : "biomon";
    } catch {
      return "biomon";
    }
  },
});

export const $equipmentSubTab = persistentAtom<EquipmentSubTab>(
  "equipment-sub-tab",
  "armor",
  {
    encode: JSON.stringify,
    decode: (raw: string): EquipmentSubTab => {
      try {
        const v = JSON.parse(raw);
        return VALID_EQUIPMENT_TABS.includes(v) ? v : "armor";
      } catch {
        return "armor";
      }
    },
  },
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

/** Currently selected gear item ID (templateId or custom name), or null. */
export const $selectedGear = atom<string | null>(null);

/** Whether the add-custom-gear form is open. Mutually exclusive with $selectedGear. */
export const $addingGear = atom<boolean>(false);

export function selectGear(id: string | null): void {
  $addingGear.set(false);
  $selectedGear.set(id);
}

export function startAddingGear(): void {
  $selectedGear.set(null);
  $addingGear.set(true);
}
