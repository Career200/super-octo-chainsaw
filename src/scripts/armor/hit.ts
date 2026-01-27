import {
  BODY_PARTS,
  PART_ABBREV,
  PART_NAMES,
  getEffectiveSP,
  sortByLayerOrder,
  type ArmorPiece,
  type BodyPartName,
} from "./core";
import { damageArmor, getArmorPiece, getBodyPartLayers } from "../../stores/armor";
import { recordDamage, type ArmorDamageEntry } from "../../stores/damage-history";
import { getSkinWeaveSP, damageSkinWeave } from "../../stores/skinweave";
import { createPopover, notify } from "../ui/popover";
import {
  createSingleSelect,
  createMultiSelect,
  type SelectOption,
} from "../ui/select";

export type DamageType =
  | "normal"
  | "ap"
  | "edged"
  | "mono"
  | "slug"
  | "fire"
  | "explosive";

const BODY_PART_OPTIONS: SelectOption<BodyPartName>[] = BODY_PARTS.map(
  (part) => ({
    value: part,
    label: PART_ABBREV[part],
  }),
);

const BODY_PART_GRID = `
  "all . head . none"
  ". left_arm torso right_arm ."
  ". left_leg ignoresp right_leg ."
`;

const DAMAGE_TYPE_OPTIONS: SelectOption<DamageType>[] = [
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
      "Blades, knives, swords. SP to 1/2 against soft armor only. Hard armor provides full protection.",
  },
  {
    value: "mono",
    label: "Mono",
    description:
      "Monoweapons (monomolecular edge). SP to 1/3 vs soft armor, SP to 2/3 vs hard armor. Cuts through almost anything.",
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
      "Explosive/blast damage. SP to 1/3. Half penetrating damage is blunt/concussion - remove after a successful BT save(additinal check, after stun/shock (if successful)). Soft armor takes 2 SP ablation immediately; hard armor takes 1/4 its SP as ablation. Worn equipment may be damaged. Note: may imply shrapnel (1d10 to random location unless behind cover). Deafens unless Level Dampeners are employed.",
  },
];

export interface DamageResult {
  penetrating: number;
  degradation: Map<string, number>;
}

export interface DamageOptions {
  /** Scale degradation by damage over threshold. Default: true
   *  - true: soft loses 1 + floor(over/5), hard loses 1 + floor(over/6)
   *  - false: all layers lose exactly 1 SP (vanilla staged penetration) */
  scaledDegradation?: boolean;
  /** SkinWeave SP for this body part (0 if not installed) */
  skinWeaveSP?: number;
}

/**
 * Calculate damage penetration through layered armor.
 *
 * ARMOR MECHANICS:
 * - Protection uses EFFECTIVE SP (proportional armor bonus for layers)
 * - If damage ≤ effective SP: stopped, no degradation
 * - If damage > effective SP: penetrating damage to character, layers degrade
 *
 * DEGRADATION (when penetrated):
 * - All layers: base 1 SP loss
 * - scaledDegradation: true (default)
 *   - Top layer only: additional floor(over / 5) for soft, floor(over / 6) for hard
 *   - If top layer reduced to 0, excess cascades to next layer
 * - scaledDegradation: false (vanilla)
 *   - All layers lose exactly 1 SP
 *
 * NOTE: Armor health is tracked per-body-part. A jacket hit on the arm
 * doesn't degrade the torso protection.
 *
 * @param activeLayers - Pre-filtered (worn, spCurrent > 0) and sorted by spCurrent desc
 */
export function calculateDamage(
  activeLayers: ArmorPiece[],
  damage: number,
  options: DamageOptions = {},
): DamageResult {
  const { scaledDegradation = true, skinWeaveSP = 0 } = options;
  const degradation = new Map<string, number>();

  if (activeLayers.length === 0 && skinWeaveSP <= 0) {
    return { penetrating: damage, degradation };
  }

  const effectiveSP = getEffectiveSP(activeLayers, skinWeaveSP);
  if (damage <= effectiveSP) {
    return { penetrating: 0, degradation };
  }

  const over = damage - effectiveSP;

  // All layers get base 1 degradation
  for (const layer of activeLayers) {
    degradation.set(layer.id, 1);
  }

  // Top layer gets additional scaled degradation, with cascade on overflow
  if (scaledDegradation && activeLayers.length > 0) {
    const topLayer = activeLayers[0];
    const divisor = topLayer.type === "soft" ? 5 : 6;
    const totalTopDeg = 1 + Math.floor(over / divisor);

    if (totalTopDeg <= topLayer.spCurrent) {
      degradation.set(topLayer.id, totalTopDeg);
    } else {
      // Overflow: cap top layer, cascade excess
      degradation.set(topLayer.id, topLayer.spCurrent);
      let leftover = totalTopDeg - topLayer.spCurrent;

      for (let i = 1; i < activeLayers.length && leftover > 0; i++) {
        const layer = activeLayers[i];
        const baseDeg = degradation.get(layer.id)!;
        const canAdd = Math.max(0, layer.spCurrent - baseDeg);
        const toAdd = Math.min(leftover, canAdd);
        degradation.set(layer.id, baseDeg + toAdd);
        leftover -= toAdd;
      }
    }
  }

  return { penetrating: over, degradation };
}

export function applyHit(bodyPart: BodyPartName, damage: number): DamageResult {
  const layers = getBodyPartLayers(bodyPart);
  const activeBefore = sortByLayerOrder(
    layers.filter((l) => l.worn && l.spCurrent > 0),
  );
  const skinWeaveSP = getSkinWeaveSP(bodyPart);

  const result = calculateDamage(activeBefore, damage, { skinWeaveSP });

  // Apply degradation to each armor piece at this specific body part
  for (const [armorId, amount] of result.degradation) {
    damageArmor(armorId, bodyPart, amount);
  }

  // SkinWeave takes 1 damage when armor is penetrated (always bottom layer)
  if (result.penetrating > 0 && skinWeaveSP > 0) {
    damageSkinWeave(bodyPart, 1);
  }

  // Check for layer flip (top layer changed)
  if (activeBefore.length >= 2 && result.degradation.size > 0) {
    const topBefore = activeBefore[0];
    const activeAfter = sortByLayerOrder(
      activeBefore
        .map((l) => ({
          ...l,
          spCurrent: l.spCurrent - (result.degradation.get(l.id) ?? 0),
        }))
        .filter((l) => l.spCurrent > 0),
    );
    const topAfter = activeAfter[0];

    if (topAfter && topBefore.id !== topAfter.id) {
      const anchor = document.getElementById(`part-${bodyPart}`);
      if (anchor) {
        notify(anchor, {
          message: `${topBefore.name} shredded — ${topAfter.name} taking point`,
          type: "info",
          duration: 6000,
        });
      }
    }
  }

  return result;
}

function createBodyPartSelector(): {
  element: HTMLElement;
  getSelected: () => BodyPartName[];
  isNoneSelected: () => boolean;
  isIgnoreSP: () => boolean;
} {
  let ignoreSP = false;

  const multiSelect = createMultiSelect<BodyPartName>({
    options: BODY_PART_OPTIONS,
    defaultValue: ["head"],
    showAllButton: true,
    allButtonLabel: "Full",
    showNoneButton: true,
    noneButtonLabel: "None",
    noneDeselectValue: "head",
    gridTemplateAreas: BODY_PART_GRID,
    allGridArea: "all",
    noneGridArea: "none",
    className: "hit-body-select",
  });

  const ignoreSPBtn = document.createElement("button");
  ignoreSPBtn.type = "button";
  ignoreSPBtn.className = "select-option select-option-ignoresp";
  ignoreSPBtn.textContent = "Ignore SP";
  ignoreSPBtn.title = "Bypass armor completely (fire, EMP, etc.)";
  ignoreSPBtn.style.gridArea = "ignoresp";
  ignoreSPBtn.addEventListener("click", () => {
    ignoreSP = !ignoreSP;
    ignoreSPBtn.classList.toggle("selected", ignoreSP);
  });

  const container = multiSelect.element.querySelector(".select-options");
  container?.appendChild(ignoreSPBtn);

  return {
    element: multiSelect.element,
    getSelected: () => multiSelect.getSelected(),
    isNoneSelected: () => multiSelect.isNoneSelected(),
    isIgnoreSP: () => ignoreSP,
  };
}

function createDamageTypeSelector() {
  return createSingleSelect<DamageType>({
    options: DAMAGE_TYPE_OPTIONS,
    defaultValue: "normal",
    showDescription: true,
  });
}

export function setupHitButton() {
  const btn = document.getElementById("btn-im-hit");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // Don't trigger panel collapse

    const { popover, cleanup, reposition } = createPopover(btn, {
      backdrop: true,
      className: "popover-danger popover-hit",
    });

    const selectorLabel = document.createElement("p");
    selectorLabel.className = "popover-message";
    selectorLabel.textContent = "Where?";

    const {
      element: selector,
      getSelected,
      isNoneSelected,
      isIgnoreSP,
    } = createBodyPartSelector();

    const typeLabel = document.createElement("p");
    typeLabel.className = "popover-message";
    typeLabel.textContent = "What hit you?";

    const { element: typeSelector, getSelected: getDamageType } =
      createDamageTypeSelector();

    const inputLabel = document.createElement("p");
    inputLabel.className = "popover-message";
    inputLabel.textContent = "Raw damage?";

    const input = document.createElement("input");
    input.type = "number";
    input.className = "popover-input";
    input.placeholder = "Damage";
    input.min = "0";

    const actions = document.createElement("div");
    actions.className = "popover-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "popover-btn popover-btn-cancel";
    cancelBtn.textContent = "Dismiss";
    cancelBtn.addEventListener("click", cleanup);

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "popover-btn popover-btn-confirm";
    confirmBtn.textContent = "Apply";
    confirmBtn.addEventListener("click", () => {
      const damage = parseInt(input.value, 10);
      const parts = getSelected();
      const damageType = getDamageType();
      const isNone = isNoneSelected();
      const ignoringArmor = isIgnoreSP();

      if (!isNaN(damage) && damage > 0 && (parts.length > 0 || isNone)) {
        const typeLabel =
          DAMAGE_TYPE_OPTIONS.find((o) => o.value === damageType)?.label ??
          damageType;

        if (isNone) {
          console.log(
            `[Non-locational] ${damage} ${typeLabel} damage → ${damage} penetrating`,
          );
          console.warn(`⚠️ CHARACTER TAKES ${damage} DAMAGE (non-locational)`);
          recordDamage({
            rawDamage: damage,
            damageType,
            bodyParts: "none",
            effectiveSP: 0,
            armorDamage: [],
            penetrating: damage,
            ignoredArmor: false,
          });
          cleanup();
          return;
        }

        for (const part of parts) {
          const partLabel = PART_NAMES[part];

          if (ignoringArmor) {
            console.log(
              `[${partLabel}] ${damage} ${typeLabel} damage → ${damage} penetrating (SP ignored)`,
            );
            console.warn(
              `⚠️ CHARACTER TAKES ${damage} DAMAGE TO ${partLabel.toUpperCase()}`,
            );
            recordDamage({
              rawDamage: damage,
              damageType,
              bodyParts: [part],
              effectiveSP: 0,
              armorDamage: [],
              penetrating: damage,
              ignoredArmor: true,
            });
            continue;
          }

          const layers = getBodyPartLayers(part);
          const skinWeaveSP = getSkinWeaveSP(part);
          const effectiveSP = getEffectiveSP(layers, skinWeaveSP);
          const result = applyHit(part, damage);

          // Build armor damage entries for history
          const armorDamageEntries: ArmorDamageEntry[] = Array.from(
            result.degradation.entries(),
          ).map(([id, sp]) => {
            const armor = getArmorPiece(id);
            return {
              armorId: id,
              armorName: armor?.name ?? id,
              spLost: sp,
            };
          });

          // Add SkinWeave damage to history if it was damaged
          if (result.penetrating > 0 && skinWeaveSP > 0) {
            armorDamageEntries.push({
              armorId: "skinweave",
              armorName: "SkinWeave",
              spLost: 1,
            });
          }

          if (armorDamageEntries.length > 0) {
            const armorDamageStr = armorDamageEntries
              .map((e) => `${e.armorName}: -${e.spLost} SP`)
              .join(", ");
            console.log(
              `[${partLabel}] ${damage} ${typeLabel} damage → ${result.penetrating} penetrating | Armor: ${armorDamageStr}`,
            );
          } else {
            console.log(
              `[${partLabel}] ${damage} ${typeLabel} damage → ${result.penetrating} penetrating (no armor)`,
            );
          }

          if (result.penetrating > 0) {
            console.warn(
              `⚠️ CHARACTER TAKES ${result.penetrating} DAMAGE TO ${partLabel.toUpperCase()}`,
            );
          }

          recordDamage({
            rawDamage: damage,
            damageType,
            bodyParts: [part],
            effectiveSP,
            armorDamage: armorDamageEntries,
            penetrating: result.penetrating,
            ignoredArmor: false,
          });
        }
      }
      cleanup();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmBtn.click();
      }
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);

    popover.appendChild(selectorLabel);
    popover.appendChild(selector);
    popover.appendChild(typeLabel);
    popover.appendChild(typeSelector);
    popover.appendChild(inputLabel);
    popover.appendChild(input);
    popover.appendChild(actions);

    reposition();
    input.focus();
  });
}
