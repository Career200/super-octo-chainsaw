import { BODY_PARTS, PART_NAMES, getEffectiveSP, getTotalEV } from "../core";
import { getBodyPartLayers, getAllOwnedArmor } from "../../../stores/armor";

export function renderEffectiveSP() {
  for (const part of BODY_PARTS) {
    const container = document.getElementById(`sp-${part}`);
    if (!container) continue;

    const layers = getBodyPartLayers(part);
    const total = getEffectiveSP(layers);

    container.innerHTML = "";

    const totalSpan = document.createElement("span");
    totalSpan.className = "sp-total";
    totalSpan.textContent = total.toString();
    container.appendChild(totalSpan);

    if (layers.length > 1) {
      const breakdown = document.createElement("span");
      breakdown.className = "sp-breakdown";
      breakdown.textContent = " = ";
      container.appendChild(breakdown);

      layers.forEach((layer, i) => {
        const chip = document.createElement("span");
        chip.className = `sp-layer ${layer.type}`;
        chip.textContent = layer.spCurrent.toString();
        chip.title = `${layer.name} — ${layer.spCurrent}/${layer.spMax} SP`;
        container.appendChild(chip);

        if (i < layers.length - 1) {
          const plus = document.createElement("span");
          plus.textContent = " + ";
          container.appendChild(plus);
        }
      });
    }
  }
}

export function renderLayers() {
  for (const part of BODY_PARTS) {
    const container = document.getElementById(`layers-${part}`);
    if (!container) continue;

    container.innerHTML = "";

    for (const layer of getBodyPartLayers(part)) {
      const div = document.createElement("div");
      div.className = `layer ${layer.type}`;
      div.textContent = `${layer.name} (SP ${layer.spCurrent}/${layer.spMax})`;
      container.appendChild(div);
    }
  }
}

export function renderEV() {
  const display = document.getElementById("ev-display");
  const valueEl = document.getElementById("ev-value");
  if (!display || !valueEl) return;

  const wornArmor = getAllOwnedArmor().filter((a) => a.worn);
  const { ev, maxLayers, maxLocation } = getTotalEV(getBodyPartLayers, wornArmor);

  valueEl.textContent = ev > 0 ? `-${ev}` : "0";
  display.classList.toggle("has-penalty", ev > 0);

  const existingPenalty = display.querySelector(".ev-layer-penalty");
  if (existingPenalty) existingPenalty.remove();

  if (maxLayers >= 2 && maxLocation) {
    const penaltyBox = document.createElement("div");
    penaltyBox.className = "ev-layer-penalty";
    penaltyBox.textContent = `layering penalty — ${PART_NAMES[maxLocation]}`;
    display.appendChild(penaltyBox);
  }
}
