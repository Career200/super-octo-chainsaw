import { BODY_PARTS, getEffectiveSP } from "./core";
import {
  $armorInventory,
  getAllArmor,
  getBodyPartLayers,
  toggleArmor,
} from "../../stores/armor";

// Render effective SP for each body part
function renderEffectiveSP() {
  for (const part of BODY_PARTS) {
    const container = document.getElementById(`sp-${part}`);
    if (!container) continue;

    const layers = getBodyPartLayers(part);
    const total = getEffectiveSP(layers);

    container.innerHTML = "";

    // Total SP value
    const totalSpan = document.createElement("span");
    totalSpan.className = "sp-total";
    totalSpan.textContent = total.toString();
    container.appendChild(totalSpan);

    // Breakdown if multiple layers
    if (layers.length > 1) {
      const breakdown = document.createElement("span");
      breakdown.className = "sp-breakdown";
      breakdown.textContent = " = ";
      container.appendChild(breakdown);

      layers.forEach((layer, i) => {
        const chip = document.createElement("span");
        chip.className = `sp-layer ${layer.type}`;
        chip.textContent = layer.spCurrent.toString();
        chip.title = `${layer.name} — ${layer.spCurrent}/${layer.spTotal} SP`;
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

// Render armor layers on each body part
function renderLayers() {
  for (const part of BODY_PARTS) {
    const container = document.getElementById(`layers-${part}`);
    if (!container) continue;

    container.innerHTML = "";

    for (const layer of getBodyPartLayers(part)) {
      const div = document.createElement("div");
      div.className = `layer ${layer.type}`;
      div.textContent = `${layer.name} (SP ${layer.spCurrent}/${layer.spTotal})`;
      container.appendChild(div);
    }
  }
}

// Render armor inventory list
function renderInventory() {
  const container = document.getElementById("armor-list");
  if (!container) return;

  container.innerHTML = "";

  for (const armor of getAllArmor()) {
    const item = document.createElement("div");
    item.className = "armor-item";

    const title = document.createElement("h4");
    title.textContent = armor.name;

    const stats = document.createElement("div");
    stats.className = "armor-stats";
    stats.innerHTML = `
      Type: ${armor.type === "hard" ? "Hard" : "Soft"}<br>
      SP: ${armor.spCurrent}/${armor.spTotal}
    `;

    const btn = document.createElement("button");
    btn.className = armor.worn ? "button-remove" : "button-wear";
    btn.textContent = armor.worn ? "Remove" : "Wear";
    btn.addEventListener("click", () => toggleArmor(armor.id));

    item.appendChild(title);
    item.appendChild(stats);
    item.appendChild(btn);
    container.appendChild(item);
  }
}

// Render everything
function renderAll() {
  renderInventory();
  renderEffectiveSP();
  renderLayers();
}

// Subscribe to store changes - this is the reactive part
$armorInventory.subscribe(() => {
  renderAll();
});

// Initial render on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
});
