import { BODY_PARTS, getEffectiveSP } from "./core";
import {
  $ownedArmor,
  getAllOwnedArmor,
  getBodyPartLayers,
  toggleArmor,
  discardArmor,
  acquireArmor,
  armorTemplates,
} from "../../stores/armor";

// --- Body Part SP Display ---

function renderEffectiveSP() {
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

// --- Body Part Layers Display ---

function renderLayers() {
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

// --- Owned Inventory ---

function renderOwnedInventory() {
  const container = document.getElementById("armor-list");
  if (!container) return;

  container.innerHTML = "";

  const owned = getAllOwnedArmor();

  if (owned.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "No armor owned. Visit the store to acquire some.";
    container.appendChild(empty);
    return;
  }

  for (const armor of owned) {
    const item = document.createElement("div");
    item.className = "armor-item";

    const title = document.createElement("h4");
    title.textContent = armor.name;

    const stats = document.createElement("div");
    stats.className = "armor-stats";
    stats.innerHTML = `
      Type: ${armor.type === "hard" ? "Hard" : "Soft"}<br>
      SP: ${armor.spCurrent}/${armor.spMax}
    `;

    const actions = document.createElement("div");
    actions.className = "armor-actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = armor.worn ? "button-remove" : "button-wear";
    toggleBtn.textContent = armor.worn ? "Remove" : "Wear";
    toggleBtn.addEventListener("click", () => toggleArmor(armor.id));

    const discardBtn = document.createElement("button");
    discardBtn.className = "button-discard";
    discardBtn.textContent = "Discard";
    discardBtn.addEventListener("click", () => {
      if (confirm(`Discard ${armor.name}?`)) {
        discardArmor(armor.id);
      }
    });

    actions.appendChild(toggleBtn);
    actions.appendChild(discardBtn);

    item.appendChild(title);
    item.appendChild(stats);
    item.appendChild(actions);
    container.appendChild(item);
  }
}

// --- Store (Templates) ---

function renderStore() {
  const container = document.getElementById("armor-store");
  if (!container) return;

  container.innerHTML = "";

  for (const template of Object.values(armorTemplates)) {
    const item = document.createElement("div");
    item.className = "store-item";

    const title = document.createElement("h4");
    title.textContent = template.name;

    const stats = document.createElement("div");
    stats.className = "armor-stats";
    stats.innerHTML = `
      Type: ${template.type === "hard" ? "Hard" : "Soft"}<br>
      SP: ${template.spMax}${template.ev ? ` | EV: ${template.ev}` : ""}${template.cost ? ` | Cost: ${template.cost}eb` : ""}
    `;

    const buyBtn = document.createElement("button");
    buyBtn.className = "button-buy";
    buyBtn.textContent = "Acquire";
    buyBtn.addEventListener("click", () => {
      acquireArmor(template.templateId);
    });

    item.appendChild(title);
    item.appendChild(stats);
    item.appendChild(buyBtn);
    container.appendChild(item);
  }
}

// --- Render All ---

function renderAll() {
  renderOwnedInventory();
  renderStore();
  renderEffectiveSP();
  renderLayers();
}

// Subscribe to store changes
$ownedArmor.subscribe(() => {
  renderAll();
});

// Initial render
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
});
