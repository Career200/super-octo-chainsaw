import type { SelectOption } from "../ui/select";

export type DamageType =
  | "normal"
  | "ap"
  | "edged"
  | "mono"
  | "slug"
  | "fire"
  | "explosive";

export const DAMAGE_TYPE_OPTIONS: SelectOption<DamageType>[] = [
  {
    value: "normal",
    label: "Normal",
    description: "Standard damage. Full SP, full penetrating damage.",
  },
  {
    value: "ap",
    label: "AP",
    description:
      "Armor Piercing. SP to 1/2, but penetrating damage also halved. Designed to punch through armor at the cost of wound severity.",
  },
  {
    value: "edged",
    label: "Edged",
    description:
      "Blades, knives, swords. SP to 1/2 against soft armor only. Hard armor provides full protection. Use top layer to determine armor type",
  },
  {
    value: "mono",
    label: "Mono",
    description:
      "Monoweapons (monomolecular edge). SP to 1/3 vs soft armor, SP to 2/3 vs hard armor (use top layer to determine armor type). Cuts through almost anything.",
  },
  {
    value: "slug",
    label: "Slug",
    description:
      "Shotgun slugs. SP to 1/2 like AP, but penetrating damage is NOT halved. High mass, high impact.",
  },
  {
    value: "fire",
    label: "Fire",
    description:
      "Thermal damage. SP full if total fire damage below 15, and for fireproofed or sufficiently sealed armor, otherwise ignored - too intense - and armor damaged by 4/round. Requires a COOL (Pain Editor bonus applies) save or spend next turn to drop and roll. May cause ongoing burn effects. NOTE: use 'ignore SP' tag if armor is not fireproofed, decrease armor health by 4 manually.",
  },
  {
    value: "explosive",
    label: "Explosive",
    description:
      "Explosive/blast damage. Use 1/3 of lowest SP of all affected body parts. Half penetrating damage is blunt/concussion - remove after a successful BT save(additinal check, after stun/shock (if successful)). Soft armor takes 2 SP ablation immediately; hard armor takes 1/4 its SP as ablation. Worn equipment may be damaged. Note: may imply shrapnel (1d10 to random location unless behind cover). Deafens unless Level Dampeners are employed.",
  },
];
