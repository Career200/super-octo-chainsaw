/**
 * Character Store
 *
 * Central module that combines all character-related stores.
 *
 * - Keep atomic stores small and focused (health, armor are separate)
 * - Use computed stores for derived state
 * - Re-export for convenient access
 */

import { computed } from "nanostores";
import { $health } from "./health";
import { $ownedArmor, getAllOwnedArmor, getInstalledImplants } from "./armor";
import { getWoundLevel, type WoundState } from "@scripts/biomon/core";
import { getTotalEV, type ArmorPiece } from "@scripts/armor/core";

export { $health } from "./health";
export { $ownedArmor } from "./armor";

export interface CharacterState {
  health: WoundState;
  woundLevel: string | null;
  stunLevel: string | null;
  armor: {
    worn: ArmorPiece[];
    implants: ArmorPiece[];
    ev: number;
  };
}

// --- Computed Stores ---

export const $character = computed(
  [$health, $ownedArmor],
  (health, _ownedArmor): CharacterState => {
    const wornArmor = getAllOwnedArmor().filter((a) => a.worn && !a.layer);
    const implants = getInstalledImplants();
    const ev = getTotalEV(wornArmor, implants);

    return {
      health,
      woundLevel: getWoundLevel(health.physical),
      stunLevel: getWoundLevel(health.stun),
      armor: {
        worn: wornArmor,
        implants,
        ev: ev.ev,
      },
    };
  },
);

/**
 * Just the wound level - useful for UI that only cares about severity
 */
export const $woundLevel = computed($health, (health) => ({
  physical: getWoundLevel(health.physical),
  stun: getWoundLevel(health.stun),
}));

/**
 * Character's current EV penalty
 */
export const $encumbrance = computed($ownedArmor, () => {
  const wornArmor = getAllOwnedArmor().filter((a) => a.worn && !a.layer);
  const implants = getInstalledImplants();
  return getTotalEV(wornArmor, implants);
});
