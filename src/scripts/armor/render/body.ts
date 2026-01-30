import {
  BODY_PARTS,
  PART_NAMES,
  getEffectiveSP,
  getImplantSP,
  sortByLayerOrder,
  proportionalArmorBonus,
} from "../core";
import {
  getBodyPartLayers,
  getImplantsForPart,
  isSkinweave,
} from "@stores/armor";
import { $encumbrance } from "@stores/character";
import { getHealthClassFromSP } from "./common";
import { createPopover } from "../../ui/popover";

export function renderEffectiveSP() {
  for (const part of BODY_PARTS) {
    const container = document.getElementById(`sp-${part}`);
    if (!container) continue;

    const layers = getBodyPartLayers(part);
    const implants = getImplantsForPart(part);
    // Faceplate only protects face, not head
    const implantsSP = implants.filter((i) => i.layer !== "faceplate");

    const total = getEffectiveSP(layers, { implants: implantsSP, part });

    container.innerHTML = "";

    const totalSpan = document.createElement("span");
    totalSpan.className = "sp-total";
    totalSpan.textContent = total.toString();
    container.appendChild(totalSpan);

    // Show breakdown if multiple sources (in layer order)
    const sorted = sortByLayerOrder(layers);
    const plating = implants.filter((i) => i.layer === "plating");
    const skinweave = implants.filter((i) => isSkinweave(i));
    const subdermal = implants.filter((i) => i.layer === "subdermal");

    const activeImplants = [...plating, ...skinweave, ...subdermal].filter(
      (i) => getImplantSP(i, part) > 0,
    );
    const sourceCount = sorted.length + activeImplants.length;
    const hasMultipleSources = sourceCount > 1;

    if (hasMultipleSources) {
      // Order: worn armor (by SP), plating, skinweave, subdermal
      const spParts = [
        ...sorted.map((l) => l.spCurrent),
        ...activeImplants.map((i) => getImplantSP(i, part)),
      ];
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
  for (const part of BODY_PARTS) {
    const container = document.getElementById(`layers-${part}`);
    if (!container) continue;

    container.innerHTML = "";

    const sorted = sortByLayerOrder(getBodyPartLayers(part));
    const implants = getImplantsForPart(part);

    // Separate implants by layer type for ordering
    const plating = implants.filter((i) => i.layer === "plating");
    const skinweave = implants.filter((i) => isSkinweave(i));
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
    for (const implant of skinweave) {
      const currentSP = implant.spByPart[part] ?? 0;
      container.appendChild(
        renderLayerDiv(
          "SkinWeave",
          currentSP,
          implant.spMax,
          "layer-skinweave",
        ),
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

  const { ev, maxLayers, maxLocation } = $encumbrance.get();

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

interface FaceLayer {
  name: string;
  sp: number;
}

function getFaceLayers(): FaceLayer[] {
  const headLayers = getBodyPartLayers("head");
  const implants = getImplantsForPart("head");
  const layers: FaceLayer[] = [];

  // Hard helmets protect face at half SP
  for (const layer of headLayers) {
    if (layer.type === "hard") {
      const sp = Math.floor(layer.spCurrent / 2);
      if (sp > 0) {
        layers.push({ name: `${layer.name} (½)`, sp });
      }
    }
  }

  // Faceplate provides full protection
  const faceplate = implants.find((i) => i.layer === "faceplate");
  if (faceplate) {
    const sp = faceplate.spByPart["head"] ?? 0;
    if (sp > 0) {
      layers.push({ name: faceplate.name, sp });
    }
  }

  // Skinweave provides full protection
  const skinweave = implants.find((i) => isSkinweave(i));
  if (skinweave) {
    const sp = getImplantSP(skinweave, "head");
    if (sp > 0) {
      layers.push({ name: "SkinWeave", sp });
    }
  }

  return layers;
}

function calculateFaceSP(layers: FaceLayer[]): number {
  if (layers.length === 0) return 0;

  const sorted = [...layers].sort((a, b) => b.sp - a.sp);
  let effectiveSP = sorted[0].sp;

  for (let i = 1; i < sorted.length; i++) {
    const layerSP = sorted[i].sp;
    const diff = effectiveSP - layerSP;
    const bonus = Math.min(layerSP, proportionalArmorBonus(diff));
    effectiveSP += bonus;
  }

  return effectiveSP;
}

export function renderFaceSP() {
  const container = document.getElementById("sp-face");
  if (!container) return;

  const layers = getFaceLayers();
  const total = calculateFaceSP(layers);

  container.textContent = total.toString();
}

export function setupFaceHelp() {
  const helpIcon = document.querySelector("#part-face .help-trigger");
  if (!helpIcon) return;

  helpIcon.removeAttribute("title");

  helpIcon.addEventListener("click", (e) => {
    e.stopPropagation();

    const { popover, reposition } = createPopover(helpIcon as HTMLElement, {
      className: "popover-help popover-face-help",
    });

    const layers = getFaceLayers();

    let layerListHtml = "";
    if (layers.length > 0) {
      const sorted = [...layers].sort((a, b) => b.sp - a.sp);
      layerListHtml = `
        <section>
          <h4>Active Protection</h4>
          <ul class="face-layer-list">
            ${sorted.map((l) => `<li>${l.name}: SP ${l.sp}</li>`).join("")}
          </ul>
        </section>
      `;
    } else {
      layerListHtml = `
        <section>
          <p class="face-no-protection">No face protection equipped.</p>
        </section>
      `;
    }

    popover.innerHTML = `
      <h3>Face Protection</h3>
      <section>
        <h4>Targeting</h4>
        <p>On head hits, roll <strong>1d10</strong>: results <strong>1-4</strong> hit the face,
        <strong>5-10</strong> hit the head. Face damage degrades head armor.</p>
      </section>
      <section>
        <h4>Coverage</h4>
        <ul>
          <li><strong>Heavy helmets</strong> protect face at half SP</li>
          <li><strong>Faceplate</strong> provides full protection</li>
          <li><strong>SkinWeave</strong> provides full protection</li>
        </ul>
      </section>
      ${layerListHtml}
    `;

    reposition();
  });
}
