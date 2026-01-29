import {
  BODY_PARTS,
  PART_NAMES,
  getEffectiveSP,
  getTotalEV,
  sortByLayerOrder,
} from "../core";
import {
  getBodyPartLayers,
  getAllOwnedArmor,
  getImplantsForPart,
  getInstalledImplants,
  isImplant,
} from "../../../stores/armor";
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
    const implants = getImplantsForPart(part);
    const skinWeaveSP = getSkinWeaveSP(part);

    // Separate plating and subdermal
    const plating = implants.filter((i) => i.layer === "plating");
    const subdermal = implants.filter((i) => i.layer === "subdermal");

    const platingSP = plating.map((i) => i.spByPart[part] ?? 0);
    const subdermalSP = subdermal.reduce(
      (sum, i) => sum + (i.spByPart[part] ?? 0),
      0,
    );

    const total = getEffectiveSP(layers, {
      platingSP,
      skinWeaveSP,
      subdermalSP,
    });

    container.innerHTML = "";

    const totalSpan = document.createElement("span");
    totalSpan.className = "sp-total";
    totalSpan.textContent = total.toString();
    container.appendChild(totalSpan);

    // Show breakdown if multiple sources
    const sorted = sortByLayerOrder(layers);
    const sourceCount =
      sorted.length +
      plating.length +
      subdermal.length +
      (skinWeaveSP > 0 ? 1 : 0);
    const hasMultipleSources = sourceCount > 1;

    if (hasMultipleSources) {
      // Order: worn armor, plating, skinweave, subdermal
      const spParts = [
        ...sorted.map((l) => l.spCurrent),
        ...platingSP,
      ];
      if (skinWeaveSP > 0) {
        spParts.push(skinWeaveSP);
      }
      if (subdermalSP > 0) {
        spParts.push(subdermalSP);
      }
      const breakdown = document.createElement("span");
      breakdown.className = "sp-breakdown";
      breakdown.textContent = ` = ${spParts.join(" + ")}`;
      container.appendChild(breakdown);
    }
  }
}

function renderLayerDiv(
  name: string,
  currentSP: number,
  maxSP: number,
  className: string,
): HTMLElement {
  const div = document.createElement("div");
  div.className = `layer ${className}`;
  div.title = `${name} — ${currentSP}/${maxSP} SP`;

  const nameSpan = document.createElement("span");
  nameSpan.className = "layer-name";
  nameSpan.textContent = name;

  const healthBar = document.createElement("span");
  const healthPercent = (currentSP / maxSP) * 100;
  healthBar.className = `layer-health ${getHealthClassFromSP(currentSP, maxSP)}`;
  healthBar.style.width = `${healthPercent}%`;

  div.appendChild(nameSpan);
  div.appendChild(healthBar);
  return div;
}

export function renderLayers() {
  const hasSkinWeave = isSkinWeaveInstalled();

  for (const part of BODY_PARTS) {
    const container = document.getElementById(`layers-${part}`);
    if (!container) continue;

    container.innerHTML = "";

    const sorted = sortByLayerOrder(getBodyPartLayers(part));
    const implants = getImplantsForPart(part);
    const plating = implants.filter((i) => i.layer === "plating");
    const subdermal = implants.filter((i) => i.layer === "subdermal");

    // 1. Worn armor (sorted by SP)
    for (const layer of sorted) {
      container.appendChild(
        renderLayerDiv(layer.name, layer.spCurrent, layer.spMax, ""),
      );
    }

    // 2. Body plating (under worn armor, above skinweave)
    for (const implant of plating) {
      const currentSP = implant.spByPart[part] ?? 0;
      container.appendChild(
        renderLayerDiv(
          implant.name,
          currentSP,
          implant.spMax,
          "layer-skinweave", // reuse skinweave style
        ),
      );
    }

    // 3. SkinWeave
    if (hasSkinWeave) {
      const skinWeaveSP = getSkinWeaveSP(part);
      const skinWeaveLevel = getSkinWeaveLevel();
      container.appendChild(
        renderLayerDiv("SkinWeave", skinWeaveSP, skinWeaveLevel, "layer-skinweave"),
      );
    }

    // 4. Subdermal (below skinweave)
    for (const implant of subdermal) {
      const currentSP = implant.spByPart[part] ?? 0;
      container.appendChild(
        renderLayerDiv(
          implant.name,
          currentSP,
          implant.spMax,
          "layer-skinweave", // reuse skinweave style
        ),
      );
    }
  }
}

export function renderEV() {
  const display = document.getElementById("ev-display");
  const valueEl = document.getElementById("ev-value");
  if (!display || !valueEl) return;

  const wornArmor = getAllOwnedArmor().filter((a) => a.worn && !isImplant(a));
  const installedImplants = getInstalledImplants();
  const { ev, maxLayers, maxLocation } = getTotalEV(wornArmor, installedImplants);

  valueEl.textContent = ev > 0 ? `-${ev}` : "0";
  display.classList.toggle("has-penalty", ev > 0);

  // Remove existing penalty box
  display.querySelectorAll(".ev-layer-penalty").forEach((el) => el.remove());

  if (maxLayers >= 2 && maxLocation) {
    const penaltyBox = document.createElement("div");
    penaltyBox.className = "ev-layer-penalty";
    penaltyBox.textContent = `layering penalty — ${PART_NAMES[maxLocation]}`;
    display.appendChild(penaltyBox);
  }
}
