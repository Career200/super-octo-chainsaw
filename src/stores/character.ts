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
import { $encumbrance } from "./armor";
import { getWoundLevel, type WoundState } from "@scripts/biomon/core";

export { $health } from "./health";
export { $ownedArmor, $encumbrance } from "./armor";
export { $stats, $REF } from "./stats";

export interface CharacterState {
  health: WoundState;
  woundLevel: string | null;
  stunLevel: string | null;
  ev: number;
}

// --- Computed Stores ---

export const $character = computed(
  [$health, $encumbrance],
  (health, encumbrance): CharacterState => ({
    health,
    woundLevel: getWoundLevel(health.physical),
    stunLevel: getWoundLevel(health.stun),
    ev: encumbrance.ev,
  }),
);

/**
 * Just the wound level - useful for UI that only cares about severity
 */
export const $woundLevel = computed($health, (health) => ({
  physical: getWoundLevel(health.physical),
  stun: getWoundLevel(health.stun),
}));
