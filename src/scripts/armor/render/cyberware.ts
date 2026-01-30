import { createPopover, notify } from "../../ui/popover";
import {
  $ownedArmor,
  getImplantTemplates,
  getInstalledImplants,
  getInstalledSkinweave,
  getSkinweaveLevel,
  installImplant,
  installSkinweave,
  uninstallImplant,
  uninstallSkinweave,
  isImplantInstalled,
  isSkinweave,
} from "../../../stores/armor";
import { getHealthClassFromSP } from "./common";

// ===================
// SKINWEAVE
// ===================

export type SkinweaveLevel = 0 | 8 | 10 | 12 | 14;

const SKINWEAVE_TEMPLATE_MAP: Record<SkinweaveLevel, string | null> = {
  0: null,
  8: "skinweave_8",
  10: "skinweave_10",
  12: "skinweave_12",
  14: "skinweave_14",
};

export function renderSkinweave(): void {
  const display = document.getElementById("skinweave-display");
  const select = document.getElementById(
    "skinweave-select",
  ) as HTMLSelectElement | null;

  if (!display || !select) return;

  const skinweave = getInstalledSkinweave();
  const isInstalled = skinweave !== null;
  const level = getSkinweaveLevel();

  display.classList.toggle("installed", isInstalled);
  select.value = level.toString();
}

export function setupSkinweave(): void {
  const select = document.getElementById(
    "skinweave-select",
  ) as HTMLSelectElement | null;
  if (!select) return;

  select.addEventListener("change", () => {
    const level = parseInt(select.value, 10) as SkinweaveLevel;
    const templateId = SKINWEAVE_TEMPLATE_MAP[level];

    if (templateId) {
      installSkinweave(templateId);
    } else {
      uninstallSkinweave();
    }
  });

  renderSkinweave();
}

// ===================
// IMPLANTS
// ===================

export function renderImplants(): void {
  const display = document.getElementById("implants-display");
  const list = document.getElementById("implants-list");

  if (!display || !list) return;

  // Exclude skinweave - it has its own UI section
  const installed = getInstalledImplants().filter((i) => !isSkinweave(i));
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

  if (template.description) {
    const desc = document.createElement("div");
    desc.className = "armor-stats";
    desc.style.marginTop = "4px";
    desc.style.fontStyle = "italic";
    desc.textContent = template.description;
    item.appendChild(desc);
  }

  const actions = document.createElement("div");
  actions.className = "armor-actions";

  if (installed) {
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-ghost-danger";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      uninstallImplant(templateId);
      onUpdate();
    });
    actions.appendChild(removeBtn);
  } else {
    const installBtn = document.createElement("button");
    installBtn.className = "btn-ghost";
    installBtn.textContent = "Install";
    installBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const result = installImplant(templateId);
      if (!result.success) {
        notify(installBtn, { message: result.error, type: "error" });
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
      // Exclude skinweave - it has its own UI section
      const templateIds = Object.keys(templates).filter(
        (id) => !isSkinweave(id),
      );
      for (const templateId of templateIds) {
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

  $ownedArmor.subscribe(() => {
    renderImplants();
  });

  renderImplants();
}
