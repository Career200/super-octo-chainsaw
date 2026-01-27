import { BODY_PARTS, PART_NAMES, getEffectiveSP, getTotalEV } from "../core";
import { getBodyPartLayers, getAllOwnedArmor } from "../../../stores/armor";
import { getHealthClass } from "./common";

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
      breakdown.textContent = ` = ${layers.map((l) => l.spCurrent).join(" + ")}`;
      container.appendChild(breakdown);
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
      div.className = "layer";
      div.title = `${layer.name} — ${layer.spCurrent}/${layer.spMax} SP`;

      const name = document.createElement("span");
      name.className = "layer-name";
      name.textContent = layer.name;

      const healthPercent = (layer.spCurrent / layer.spMax) * 100;
      const healthBar = document.createElement("span");
      healthBar.className = `layer-health ${getHealthClass(healthPercent)}`;
      healthBar.style.width = `${healthPercent}%`;

      div.appendChild(name);
      div.appendChild(healthBar);
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
