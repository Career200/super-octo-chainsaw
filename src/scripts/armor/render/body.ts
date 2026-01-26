import { BODY_PARTS, getEffectiveSP } from "../core";
import { getBodyPartLayers } from "../../../stores/armor";

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
