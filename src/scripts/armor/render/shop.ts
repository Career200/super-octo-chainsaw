import { acquireArmor, armorTemplates } from "../../../stores/armor";
import { renderBodyPartsCoverage } from "./common";

export function renderShop() {
  const container = document.getElementById("armor-store");
  if (!container) return;

  container.innerHTML = "";

  // Only show worn armor (exclude implants like plating, skinweave, subdermal)
  const sortedTemplates = Object.values(armorTemplates)
    .filter((t) => !t.layer)
    .sort((a, b) => {
      if (a.spMax !== b.spMax) return a.spMax - b.spMax;
      if (a.type !== b.type) return a.type === "soft" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  for (const template of sortedTemplates) {
    const item = document.createElement("div");
    item.className = "store-item";

    const header = document.createElement("div");
    header.className = "armor-header";

    const title = document.createElement("h4");
    const typeIcon = document.createElement("span");
    typeIcon.className = "armor-type-icon";
    typeIcon.textContent = template.type === "hard" ? "⬡" : "≈";
    title.appendChild(typeIcon);
    title.appendChild(document.createTextNode(template.name));

    const stats = document.createElement("span");
    stats.className = "armor-sp";
    stats.textContent = template.ev
      ? `${template.spMax} | EV: ${template.ev}`
      : `${template.spMax}`;

    header.appendChild(title);
    header.appendChild(stats);

    const coverage = renderBodyPartsCoverage(template.bodyParts);

    const description = document.createElement("p");
    description.className = "store-description";
    description.textContent = template.description ?? "";

    const actions = document.createElement("div");
    actions.className = "store-actions";

    const handleAcquire = () => acquireArmor(template.templateId);

    const buyBtn = document.createElement("button");
    buyBtn.className = "btn-secondary";
    buyBtn.textContent = template.cost ? `Buy (${template.cost}eb)` : "Buy";
    buyBtn.addEventListener("click", handleAcquire);

    const takeBtn = document.createElement("button");
    takeBtn.className = "btn-ghost";
    takeBtn.textContent = "Take (Free)";
    takeBtn.addEventListener("click", handleAcquire);

    actions.appendChild(buyBtn);
    actions.appendChild(takeBtn);

    item.appendChild(header);
    item.appendChild(coverage);
    if (template.description) {
      item.appendChild(description);
    }
    item.appendChild(actions);
    container.appendChild(item);
  }
}
