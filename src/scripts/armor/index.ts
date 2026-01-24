import { CharacterArmor, type BodyPartName, type ArmorPiece } from "./core";
import { armorCatalog } from "./equipment";

const characterArmor = new CharacterArmor();

function getConditionPercent(armor: ArmorPiece): number {
  // will use for color coding
  return Math.round((armor.spCurrent / armor.spTotal) * 100);
}

function renderEffectiveSP() {
  (Object.keys(characterArmor.body) as BodyPartName[]).forEach((part) => {
    const container = document.getElementById(`sp-${part}`);
    if (!container) return;

    const layers = characterArmor.body[part].layers.filter(
      (l) => l.worn && l.spCurrent > 0,
    );
    const total = characterArmor.getEffectiveSP(part);

    container.innerHTML = "";

    // TOTAL
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

        chip.title = `${layer.name} — ${layer.spCurrent}/${layer.spTotal} SP)`;

        container.appendChild(chip);

        if (i < layers.length - 1) {
          const plus = document.createElement("span");
          plus.textContent = " + ";
          breakdown.appendChild(plus);
          container.appendChild(plus);
        }
      });
    }
  });
}

function renderLayers() {
  (Object.keys(characterArmor.body) as BodyPartName[]).forEach((part) => {
    const container = document.getElementById(`layers-${part}`);
    if (!container) return;

    container.innerHTML = "";

    characterArmor.body[part].layers
      .filter((l) => l.worn)
      .forEach((layer) => {
        const div = document.createElement("div");
        div.className = `layer ${layer.type}`;
        div.textContent = `${layer.name} (SP ${layer.spCurrent}/${layer.spTotal})`;
        container.appendChild(div);
      });
  });
}

function createArmorCard(armor: ArmorPiece): HTMLElement {
  const item = document.createElement("div");
  item.className = "armor-item";
  item.id = `armor-${armor.id}`;

  const title = document.createElement("h4");
  title.textContent = armor.name;

  const stats = document.createElement("div");
  stats.className = "armor-stats";
  stats.innerHTML = `
    Type: ${armor.type === "hard" ? "Hard" : "Soft"}<br>
    SP: <span id="${armor.id}-sp">${armor.spCurrent}</span>/${armor.spTotal}
  `;

  const btn = document.createElement("button");
  btn.id = `toggle-${armor.id}`;
  btn.className = "button-wear";
  btn.textContent = "Wear";

  btn.addEventListener("click", () => toggleArmor(armor));

  item.appendChild(title);
  item.appendChild(stats);
  item.appendChild(btn);

  return item;
}

function renderInventoryList() {
  const container = document.getElementById("armor-list");
  if (!container) return;

  container.innerHTML = "";

  Object.values(armorCatalog).forEach((armor) => {
    container.appendChild(createArmorCard(armor));
  });
}

function renderInventory() {
  Object.values(armorCatalog).forEach((armor) => {
    const spEl = document.getElementById(`${armor.id}-sp`);
    if (spEl) spEl.textContent = armor.spCurrent.toString();

    const btn = document.getElementById(
      `toggle-${armor.id}`,
    ) as HTMLButtonElement | null;
    if (btn) {
      btn.textContent = armor.worn ? "Remove" : "Wear";
      btn.classList.remove("button-wear", "button-remove");
      btn.classList.add(armor.worn ? "button-remove" : "button-wear");
    }
  });
}

function renderAll() {
  renderInventoryList(); // must run first
  renderEffectiveSP();
  renderLayers();
  renderInventory();
}

function toggleArmor(armor: ArmorPiece) {
  if (armor.worn) {
    characterArmor.removeArmor(armor);
  } else {
    characterArmor.addArmor(armor);
  }
  renderAll();
}

function bindArmorButtons() {
  Object.values(armorCatalog).forEach((armor) => {
    const btn = document.getElementById(`toggle-${armor.id}`);
    if (!btn) return;

    btn.addEventListener("click", () => toggleArmor(armor));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindArmorButtons();
  renderAll();
});
