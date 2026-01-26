import { acquireArmor, armorTemplates } from "../../../stores/armor";
import { renderBodyPartsCoverage } from "./common";

export function renderShop() {
  const container = document.getElementById("armor-store");
  if (!container) return;

  container.innerHTML = "";

  for (const template of Object.values(armorTemplates)) {
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

    const actions = document.createElement("div");
    actions.className = "store-actions";

    const handleAcquire = () => acquireArmor(template.templateId);

    const buyBtn = document.createElement("button");
    buyBtn.className = "button-buy";
    buyBtn.textContent = template.cost ? `Buy (${template.cost}eb)` : "Buy";
    buyBtn.addEventListener("click", handleAcquire);

    const takeBtn = document.createElement("button");
    takeBtn.className = "button-take";
    takeBtn.textContent = "Take (Free)";
    takeBtn.addEventListener("click", handleAcquire);

    actions.appendChild(buyBtn);
    actions.appendChild(takeBtn);

    item.appendChild(header);
    item.appendChild(coverage);
    item.appendChild(actions);
    container.appendChild(item);
  }
}
