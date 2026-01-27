import {
  BODY_PARTS,
  PART_ABBREV,
  PART_NAMES,
  getEffectiveSP,
  type ArmorPiece,
  type BodyPartName,
} from "./core";
import { damageArmor, getBodyPartLayers } from "../../stores/armor";
import { createPopover } from "../ui/popover";

export interface DamageResult {
  penetrating: number;
  degradation: Map<string, number>;
}

export interface DamageOptions {
  /** Scale degradation by damage over threshold. Default: true
   *  - true: soft loses 1 + floor(over/5), hard loses 1 + floor(over/6)
   *  - false: all layers lose exactly 1 SP (vanilla staged penetration) */
  scaledDegradation?: boolean;
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
 */
export function calculateDamage(
  layers: ArmorPiece[],
  damage: number,
  options: DamageOptions = {},
): DamageResult {
  const { scaledDegradation = true } = options;
  const degradation = new Map<string, number>();

  // Sort by current SP descending - highest SP is "top" layer
  const activeLayers = layers
    .filter((l) => l.worn && l.spCurrent > 0)
    .sort((a, b) => b.spCurrent - a.spCurrent);

  if (activeLayers.length === 0) {
    return { penetrating: damage, degradation };
  }

  const effectiveSP = getEffectiveSP(activeLayers);
  if (damage <= effectiveSP) {
    return { penetrating: 0, degradation };
  }

  // Armor penetrated
  const over = damage - effectiveSP;

  // All layers get base 1 degradation
  for (const layer of activeLayers) {
    degradation.set(layer.id, 1);
  }

  // Top layer gets additional scaled degradation, with cascade on overflow
  if (scaledDegradation) {
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

// Apply damage to a body part and return the result
export function applyHit(bodyPart: BodyPartName, damage: number): DamageResult {
  const layers = getBodyPartLayers(bodyPart);
  const result = calculateDamage(layers, damage);

  // Apply degradation to each armor piece at this specific body part
  for (const [armorId, amount] of result.degradation) {
    damageArmor(armorId, bodyPart, amount);
  }

  return result;
}

function createBodyPartSelector(): {
  element: HTMLElement;
  getSelected: () => BodyPartName[];
} {
  const selected = new Set<BodyPartName>();

  const container = document.createElement("div");
  container.className = "hit-body-selector";

  const updateFullState = () => {
    const fullTag = container.querySelector('[data-part="full"]');
    if (!fullTag) return;

    const allSelected = BODY_PARTS.every((p) => selected.has(p));
    fullTag.classList.toggle("selected", allSelected);
  };

  const createTag = (part: BodyPartName | "full") => {
    const tag = document.createElement("button");
    tag.type = "button";
    tag.className = "hit-body-tag";
    tag.dataset.part = part;
    tag.textContent = part === "full" ? "FULL" : PART_ABBREV[part];

    if (part === "full") {
      tag.classList.add("hit-body-tag-full");
    }

    tag.addEventListener("click", () => {
      if (part === "full") {
        const allSelected = BODY_PARTS.every((p) => selected.has(p));
        if (allSelected) {
          // Deselect all
          selected.clear();
          container
            .querySelectorAll(".hit-body-tag")
            .forEach((t) => t.classList.remove("selected"));
        } else {
          // Select all
          BODY_PARTS.forEach((p) => selected.add(p));
          container
            .querySelectorAll(".hit-body-tag")
            .forEach((t) => t.classList.add("selected"));
        }
      } else {
        if (selected.has(part)) {
          selected.delete(part);
          tag.classList.remove("selected");
        } else {
          selected.add(part);
          tag.classList.add("selected");
        }
        updateFullState();
      }
    });

    return tag;
  };

  // Build grid layout: . H . / LA T RA / LL FULL RL
  const row1 = document.createElement("div");
  row1.className = "hit-body-row";
  row1.appendChild(document.createElement("span")); // empty
  row1.appendChild(createTag("head"));
  row1.appendChild(document.createElement("span")); // empty

  const row2 = document.createElement("div");
  row2.className = "hit-body-row";
  row2.appendChild(createTag("left_arm"));
  row2.appendChild(createTag("torso"));
  row2.appendChild(createTag("right_arm"));

  const row3 = document.createElement("div");
  row3.className = "hit-body-row";
  row3.appendChild(createTag("left_leg"));
  row3.appendChild(createTag("full"));
  row3.appendChild(createTag("right_leg"));

  container.appendChild(row1);
  container.appendChild(row2);
  container.appendChild(row3);

  return {
    element: container,
    getSelected: () => Array.from(selected),
  };
}

// Setup the "I'm hit" button
export function setupHitButton() {
  const btn = document.getElementById("btn-im-hit");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // Don't trigger panel collapse

    const { popover, cleanup, reposition } = createPopover(btn, {
      backdrop: true,
      className: "popover-danger popover-hit",
    });

    // Body part selector
    const selectorLabel = document.createElement("p");
    selectorLabel.className = "popover-message";
    selectorLabel.textContent = "Where?";

    const { element: selector, getSelected } = createBodyPartSelector();

    // Damage input
    const inputLabel = document.createElement("p");
    inputLabel.className = "popover-message";
    inputLabel.textContent = "How much?";

    const input = document.createElement("input");
    input.type = "number";
    input.className = "popover-input";
    input.placeholder = "Damage";
    input.min = "0";

    // Actions
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
      if (!isNaN(damage) && damage > 0 && parts.length > 0) {
        for (const part of parts) {
          const result = applyHit(part, damage);
          const partLabel = PART_NAMES[part];

          if (result.degradation.size > 0) {
            const armorDamage = Array.from(result.degradation.entries())
              .map(([id, sp]) => `${id}: -${sp} SP`)
              .join(", ");
            console.log(
              `[${partLabel}] ${damage} damage → ${result.penetrating} penetrating | Armor: ${armorDamage}`,
            );
          } else {
            console.log(
              `[${partLabel}] ${damage} damage → ${result.penetrating} penetrating (no armor)`,
            );
          }

          if (result.penetrating > 0) {
            console.warn(
              `⚠️ CHARACTER TAKES ${result.penetrating} DAMAGE TO ${partLabel.toUpperCase()}`,
            );
          }
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
    popover.appendChild(inputLabel);
    popover.appendChild(input);
    popover.appendChild(actions);

    reposition();
    input.focus();
  });
}
