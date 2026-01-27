import {
  BODY_PARTS,
  PART_NAMES,
  getEffectiveSP,
  getTotalEV,
  sortByLayerOrder,
} from "../core";
import { getBodyPartLayers, getAllOwnedArmor } from "../../../stores/armor";
import {
  getSkinWeaveSP,
  getSkinWeaveLevel,
  isSkinWeaveInstalled,
} from "../../../stores/skinweave";
import { getHealthClassFromSP } from "./common";

export function renderEffectiveSP() {
  for (const part of BODY_PARTS) {
    const container = document.getElementById(`sp-${part}`);
    if (!container) continue;

    const layers = getBodyPartLayers(part);
    const skinWeaveSP = getSkinWeaveSP(part);
    const total = getEffectiveSP(layers, skinWeaveSP);

    container.innerHTML = "";

    const totalSpan = document.createElement("span");
    totalSpan.className = "sp-total";
    totalSpan.textContent = total.toString();
    container.appendChild(totalSpan);

    // Show breakdown if multiple sources
    const sorted = sortByLayerOrder(layers);
    const hasMultipleSources =
      sorted.length > 1 || (sorted.length >= 1 && skinWeaveSP > 0);

    if (hasMultipleSources) {
      const parts = sorted.map((l) => l.spCurrent);
      if (skinWeaveSP > 0) {
        parts.push(skinWeaveSP); // SkinWeave always last
      }
      const breakdown = document.createElement("span");
      breakdown.className = "sp-breakdown";
      breakdown.textContent = ` = ${parts.join(" + ")}`;
      container.appendChild(breakdown);
    }
  }
}

export function renderLayers() {
  const hasSkinWeave = isSkinWeaveInstalled();

  for (const part of BODY_PARTS) {
    const container = document.getElementById(`layers-${part}`);
    if (!container) continue;

    container.innerHTML = "";

    const sorted = sortByLayerOrder(getBodyPartLayers(part));

    for (const layer of sorted) {
      const div = document.createElement("div");
      div.className = "layer";
      div.title = `${layer.name} — ${layer.spCurrent}/${layer.spMax} SP`;

      const name = document.createElement("span");
      name.className = "layer-name";
      name.textContent = layer.name;

      const healthBar = document.createElement("span");
      const healthPercent = (layer.spCurrent / layer.spMax) * 100;
      healthBar.className = `layer-health ${getHealthClassFromSP(layer.spCurrent, layer.spMax)}`;
      healthBar.style.width = `${healthPercent}%`;

      div.appendChild(name);
      div.appendChild(healthBar);
      container.appendChild(div);
    }

    // SkinWeave always shown as bottom layer
    if (hasSkinWeave) {
      const skinWeaveSP = getSkinWeaveSP(part);
      const skinWeaveLevel = getSkinWeaveLevel();

      const div = document.createElement("div");
      div.className = "layer layer-skinweave";
      div.title = `SkinWeave — ${skinWeaveSP}/${skinWeaveLevel} SP`;

      const name = document.createElement("span");
      name.className = "layer-name";
      name.textContent = "SkinWeave";

      const healthBar = document.createElement("span");
      const healthPercent = (skinWeaveSP / skinWeaveLevel) * 100;
      healthBar.className = `layer-health ${getHealthClassFromSP(skinWeaveSP, skinWeaveLevel)}`;
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
  const { ev, maxLayers, maxLocation } = getTotalEV(
    getBodyPartLayers,
    wornArmor,
  );

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
