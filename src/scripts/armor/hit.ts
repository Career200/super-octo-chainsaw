import { BODY_PARTS, PART_ABBREV, type ArmorPiece, type BodyPartName } from "./core";
import { damageArmor, getBodyPartLayers } from "../../stores/armor";
import { createPopover } from "../ui/popover";

export interface DamageResult {
  penetrating: number;
  degradation: Map<string, number>;
}

// Calculate damage penetration through armor layers
export function calculateDamage(
  layers: ArmorPiece[],
  damage: number,
): DamageResult {
  const activeLayers = layers.filter((l) => l.worn && l.spCurrent > 0);
  const degradation = new Map<string, number>();

  const sorted = [...activeLayers].sort((a, b) => b.spCurrent - a.spCurrent);
  let remainingDamage = damage;

  for (const layer of sorted) {
    if (remainingDamage <= 0) break;

    const threshold =
      layer.type === "soft" ? layer.spCurrent : layer.spCurrent + 1;

    if (remainingDamage > threshold) {
      degradation.set(layer.id, 1);
      remainingDamage -= threshold;
    } else {
      degradation.set(layer.id, 1);
      remainingDamage = 0;
      break;
    }
  }

  return { penetrating: remainingDamage, degradation };
}

// Apply damage to a body part and return the result
export function applyHit(bodyPart: BodyPartName, damage: number): DamageResult {
  const layers = getBodyPartLayers(bodyPart);
  const result = calculateDamage(layers, damage);

  // Apply degradation to each armor piece
  for (const [armorId, amount] of result.degradation) {
    damageArmor(armorId, amount);
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
            .querySelectorAll(".hit-body-tag:not(.hit-body-tag-full)")
            .forEach((t) => t.classList.add("selected"));
          tag.classList.add("selected");
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
        // TODO: apply damage to selected body parts
        console.log("Damage:", damage, "Parts:", parts);
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
