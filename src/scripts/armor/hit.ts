import type { ArmorPiece, BodyPartName } from "./core";
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
export function applyHit(
  bodyPart: BodyPartName,
  damage: number,
): DamageResult {
  const layers = getBodyPartLayers(bodyPart);
  const result = calculateDamage(layers, damage);

  // Apply degradation to each armor piece
  for (const [armorId, amount] of result.degradation) {
    damageArmor(armorId, amount);
  }

  return result;
}

// Setup the "I'm hit" button
export function setupHitButton() {
  const btn = document.getElementById("btn-im-hit");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // Don't trigger panel collapse

    const { popover, cleanup, reposition } = createPopover(btn, {
      backdrop: true,
      className: "popover-danger",
    });

    const msg = document.createElement("p");
    msg.className = "popover-message";
    msg.textContent = "How much damage?";

    const input = document.createElement("input");
    input.type = "number";
    input.className = "popover-input";
    input.placeholder = "Enter damage amount";
    input.min = "0";

    const actions = document.createElement("div");
    actions.className = "popover-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "popover-btn popover-btn-cancel";
    cancelBtn.textContent = "Dismiss";
    cancelBtn.addEventListener("click", cleanup);

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "popover-btn popover-btn-confirm";
    confirmBtn.textContent = "Apply Damage";
    confirmBtn.addEventListener("click", () => {
      const damage = parseInt(input.value, 10);
      if (!isNaN(damage) && damage > 0) {
        // TODO: select body part and apply damage
        console.log("Damage to apply:", damage);
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
    popover.appendChild(msg);
    popover.appendChild(input);
    popover.appendChild(actions);

    reposition();
    input.focus();
  });
}
