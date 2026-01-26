import { acquireArmor, armorTemplates } from "../../../stores/armor";

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

    const cost = document.createElement("div");
    cost.className = "armor-stats";
    cost.textContent = template.cost ? `${template.cost}eb` : "";

    const buyBtn = document.createElement("button");
    buyBtn.className = "button-buy";
    buyBtn.textContent = "Acquire";
    buyBtn.addEventListener("click", () => {
      acquireArmor(template.templateId);
    });

    item.appendChild(header);
    if (template.cost) item.appendChild(cost);
    item.appendChild(buyBtn);
    container.appendChild(item);
  }
}
