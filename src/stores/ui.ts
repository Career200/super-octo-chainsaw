import { persistentAtom } from "@nanostores/persistent";
import type { WritableAtom } from "nanostores";
import { atom, computed } from "nanostores";

import type { BodyPartName } from "@scripts/armor/core";

const tabStoreCache = new Map<string, WritableAtom<string>>();

export function tabStore(
  key: string,
  defaultVal: string,
): WritableAtom<string> {
  let store = tabStoreCache.get(key);
  if (!store) {
    store = persistentAtom<string>(key, defaultVal, {
      encode: JSON.stringify,
      decode: (raw) => {
        try {
          return JSON.parse(raw);
        } catch {
          return defaultVal;
        }
      },
    });
    tabStoreCache.set(key, store);
  }
  return store;
}

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

/** Currently selected armor instance ID, or null. */
export const $selectedArmor = atom<string | null>(null);

/** Whether the add-custom-armor form is open. Mutually exclusive with $selectedArmor. */
export const $addingArmor = atom<boolean>(false);

export function selectArmor(id: string | null): void {
  $addingArmor.set(false);
  $selectedArmor.set(id);
  $highlightedPart.set(null);
}

export function startAddingArmor(): void {
  $selectedArmor.set(null);
  $highlightedPart.set(null);
  $addingArmor.set(true);
}

/** Body part being highlighted on the inventory grid, or null. */
export const $highlightedPart = atom<BodyPartName | null>(null);

export function highlightPart(part: BodyPartName | null): void {
  $highlightedPart.set(part);
  $selectedArmor.set(null);
}

/** Weapon + ammo share a single focus atom — mutual exclusion is structural. */
export type WeaponAmmoFocus =
  | null
  | { kind: "weapon"; id: string }
  | { kind: "adding-weapon" }
  | { kind: "ammo"; id: string }
  | { kind: "adding-ammo" };

export const $weaponAmmoFocus = atom<WeaponAmmoFocus>(null);

// Derived views — backward-compatible with existing consumers.
// nanostores computed deduplicates: subscribers only fire when the derived value changes.
export const $selectedWeapon = computed($weaponAmmoFocus, (f) =>
  f?.kind === "weapon" ? f.id : null,
);
export const $addingWeapon = computed(
  $weaponAmmoFocus,
  (f): boolean => f?.kind === "adding-weapon",
);
export const $selectedAmmo = computed($weaponAmmoFocus, (f) =>
  f?.kind === "ammo" ? f.id : null,
);
export const $addingAmmo = computed(
  $weaponAmmoFocus,
  (f): boolean => f?.kind === "adding-ammo",
);

export function selectWeapon(id: string | null): void {
  $weaponAmmoFocus.set(id ? { kind: "weapon", id } : null);
}

export function startAddingWeapon(): void {
  $weaponAmmoFocus.set({ kind: "adding-weapon" });
}

export function selectAmmo(id: string | null): void {
  $weaponAmmoFocus.set(id ? { kind: "ammo", id } : null);
}

export function startAddingAmmo(): void {
  $weaponAmmoFocus.set({ kind: "adding-ammo" });
}
