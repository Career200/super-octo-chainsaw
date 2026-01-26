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

    const sp = document.createElement("span");
    sp.className = "armor-sp";
    sp.textContent = `${template.spMax}`;

    header.appendChild(title);
    header.appendChild(sp);

    const stats = document.createElement("div");
    stats.className = "armor-stats";
    const statParts = [];
    if (template.ev) statParts.push(`EV: ${template.ev}`);
    if (template.cost) statParts.push(`${template.cost}eb`);
    stats.textContent = statParts.join(" | ");

    const buyBtn = document.createElement("button");
    buyBtn.className = "button-buy";
    buyBtn.textContent = "Acquire";
    buyBtn.addEventListener("click", () => {
      acquireArmor(template.templateId);
    });

    item.appendChild(header);
    if (statParts.length > 0) item.appendChild(stats);
    item.appendChild(buyBtn);
    container.appendChild(item);
  }
}
