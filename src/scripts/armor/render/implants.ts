import { createPopover } from "../../ui/popover";
import {
  $ownedArmor,
  getImplantTemplates,
  getInstalledImplants,
  installImplant,
  uninstallImplant,
  repairImplant,
  isImplantInstalled,
} from "../../../stores/armor";
import { getHealthClassFromSP } from "./common";

export function renderImplants(): void {
  const display = document.getElementById("implants-display");
  const list = document.getElementById("implants-list");

  if (!display || !list) return;

  const installed = getInstalledImplants();
  const hasImplants = installed.length > 0;

  display.classList.toggle("has-implants", hasImplants);

  if (hasImplants) {
    list.innerHTML = installed.map((i) => i.name).join(", ");
  } else {
    list.innerHTML = "";
  }
}

function renderImplantItem(
  templateId: string,
  container: HTMLElement,
  onUpdate: () => void,
): void {
  const templates = getImplantTemplates();
  const template = templates[templateId];
  if (!template) return;

  const installed = isImplantInstalled(templateId);
  const implants = getInstalledImplants();
  const instance = implants.find((i) => i.templateId === templateId);

  const item = document.createElement("div");
  item.className = "armor-item" + (installed ? " armor-worn" : "");

  // Header with name and SP
  const header = document.createElement("div");
  header.className = "armor-header";

  const title = document.createElement("h4");
  title.textContent = template.name;

  const sp = document.createElement("span");
  sp.className = "armor-sp";

  if (installed && instance) {
    const currentSP = instance.spCurrent;
    const isDamaged = currentSP < template.spMax;
    if (isDamaged) {
      const healthClass = getHealthClassFromSP(currentSP, template.spMax);
      sp.innerHTML = `<span class="${healthClass}">${currentSP}</span>/${template.spMax}`;
    } else {
      sp.textContent = `SP ${template.spMax}`;
    }
  } else {
    sp.textContent = `SP ${template.spMax}`;
  }

  header.appendChild(title);
  header.appendChild(sp);
  item.appendChild(header);

  // Stats row
  const stats = document.createElement("div");
  stats.className = "armor-stats";
  const parts = template.bodyParts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace("_", " "))
    .join(", ");
  const typeLabel = template.type === "hard" ? "Hard" : "Soft";
  let statsText = `${parts} | ${typeLabel}`;
  if (template.ev) {
    statsText += ` | EV -${template.ev}`;
  }
  stats.textContent = statsText;
  item.appendChild(stats);

  // Description
  if (template.description) {
    const desc = document.createElement("div");
    desc.className = "armor-stats";
    desc.style.marginTop = "4px";
    desc.style.fontStyle = "italic";
    desc.textContent = template.description;
    item.appendChild(desc);
  }

  // Actions
  const actions = document.createElement("div");
  actions.className = "armor-actions";

  if (installed && instance) {
    // Check if damaged
    const currentSP = instance.spCurrent;
    const isDamaged = currentSP < template.spMax;

    if (isDamaged) {
      const repairBtn = document.createElement("button");
      repairBtn.className = "button-wear";
      repairBtn.textContent = "Repair";
      repairBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        repairImplant(instance.id);
        onUpdate();
      });
      actions.appendChild(repairBtn);
    }

    const removeBtn = document.createElement("button");
    removeBtn.className = "button-discard";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      uninstallImplant(templateId);
      onUpdate();
    });
    actions.appendChild(removeBtn);
  } else {
    const installBtn = document.createElement("button");
    installBtn.className = "button-take";
    installBtn.textContent = "Install";
    installBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const result = installImplant(templateId);
      if (!result.success) {
        // TODO: show error
        console.error(result.error);
        return;
      }
      onUpdate();
    });
    actions.appendChild(installBtn);
  }

  item.appendChild(actions);
  container.appendChild(item);
}

export function setupImplants(): void {
  const display = document.getElementById("implants-display");
  if (!display) return;

  display.addEventListener("click", () => {
    const { popover, cleanup, reposition } = createPopover(display, {
      backdrop: true,
      className: "popover-implants",
    });

    const title = document.createElement("p");
    title.className = "popover-message";
    title.textContent = "Armor Implants";

    const description = document.createElement("p");
    description.style.fontSize = "12px";
    description.style.color = "var(--fg-soft)";
    description.style.marginBottom = "12px";
    description.textContent =
      "Subdermal armor and body plating. These count as armor layers.";

    const implantList = document.createElement("div");
    implantList.className = "implant-list";

    const renderList = () => {
      implantList.innerHTML = "";
      const templates = getImplantTemplates();
      for (const templateId of Object.keys(templates)) {
        renderImplantItem(templateId, implantList, () => {
          renderList();
          reposition();
        });
      }
    };

    renderList();

    const actions = document.createElement("div");
    actions.className = "popover-actions";

    const closeBtn = document.createElement("button");
    closeBtn.className = "popover-btn popover-btn-cancel";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", cleanup);

    actions.appendChild(closeBtn);

    popover.appendChild(title);
    popover.appendChild(description);
    popover.appendChild(implantList);
    popover.appendChild(actions);
    reposition();
  });

  // Subscribe to changes - now using $ownedArmor
  $ownedArmor.subscribe(() => {
    renderImplants();
  });

  renderImplants();
}
