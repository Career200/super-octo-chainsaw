import {
  getAllOwnedArmor,
  toggleArmor,
  discardArmor,
} from "../../../stores/armor";
import { confirm, notify } from "../../ui/popover";

export function renderOwnedInventory() {
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

    const header = document.createElement("div");
    header.className = "armor-header";

    const title = document.createElement("h4");
    const typeIcon = document.createElement("span");
    typeIcon.className = "armor-type-icon";
    typeIcon.textContent = armor.type === "hard" ? "⬡" : "≈";
    title.appendChild(typeIcon);
    title.appendChild(document.createTextNode(armor.name));

    const stats = document.createElement("span");
    stats.className = "armor-sp";
    stats.textContent = armor.ev
      ? `${armor.spCurrent}/${armor.spMax} | EV: ${armor.ev}`
      : `${armor.spCurrent}/${armor.spMax}`;

    header.appendChild(title);
    header.appendChild(stats);

    const actions = document.createElement("div");
    actions.className = "armor-actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = armor.worn ? "button-remove" : "button-wear";
    toggleBtn.textContent = armor.worn ? "Remove" : "Wear";
    toggleBtn.addEventListener("click", () => {
      const result = toggleArmor(armor.id);
      if (!result.success) {
        notify(toggleBtn, { message: result.error, type: "error" });
      }
    });

    const discardBtn = document.createElement("button");
    discardBtn.className = "button-discard";
    discardBtn.textContent = "Discard";
    discardBtn.addEventListener("click", async () => {
      const confirmed = await confirm(discardBtn, {
        message: `Discard ${armor.name}?`,
        confirmText: "Discard",
        cancelText: "Keep",
        type: "danger",
      });
      if (confirmed) {
        discardArmor(armor.id);
      }
    });

    actions.appendChild(toggleBtn);
    actions.appendChild(discardBtn);

    item.appendChild(header);
    item.appendChild(actions);
    container.appendChild(item);
  }
}
