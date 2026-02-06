import {
  getAllOwnedArmor,
  toggleArmor,
  discardArmor,
  setArmorSP,
  getArmorPiece,
  isImplant,
} from "../../../stores/armor";
import { recordManipulation } from "../../../stores/damage-history";
import { confirm, notify, createPopover } from "../../ui/popover";
import {
  renderBodyPartsCoverage,
  getConditionClassFromSP,
  getLowestSP,
} from "./common";
import { PART_ABBREV, type ArmorPiece, type BodyPartName } from "../core";

function renderArmorItem(
  armor: ArmorPiece,
  container: HTMLElement,
  showActions: boolean,
): void {
  const item = document.createElement("div");
  item.className = armor.worn ? "armor-item armor-worn" : "armor-item";

  const header = document.createElement("div");
  header.className = "flex-between gap-12 armor-header";

  const title = document.createElement("h4");
  const typeIcon = document.createElement("span");
  typeIcon.className = "armor-type-icon";
  typeIcon.textContent = armor.type === "hard" ? "⬡" : "≈";
  title.appendChild(typeIcon);
  title.appendChild(document.createTextNode(armor.name));

  const stats = document.createElement("span");
  stats.className = "armor-sp";

  const currentSp = document.createElement("span");
  currentSp.className = getConditionClassFromSP(armor.spCurrent, armor.spMax);
  currentSp.textContent = armor.spCurrent.toString();

  stats.appendChild(currentSp);
  stats.appendChild(document.createTextNode(`/${armor.spMax}`));
  if (armor.ev) {
    stats.appendChild(document.createTextNode(` | EV: ${armor.ev}`));
  }

  header.appendChild(title);
  header.appendChild(stats);

  const coverageRow = document.createElement("div");
  coverageRow.className = "armor-coverage-row";
  coverageRow.style.cursor = "pointer";
  coverageRow.addEventListener("click", (e) => {
    e.stopPropagation();
    openRepairPopover(
      coverageRow,
      armor.id,
      armor.spMax,
      armor.bodyParts,
      armor.spByPart,
    );
  });

  const repairLabel = document.createElement("span");
  repairLabel.className = "btn-ghost btn-sm";
  repairLabel.textContent = "Repair/Break";

  const coverage = renderBodyPartsCoverage(
    armor.bodyParts,
    armor.spByPart,
    armor.spMax,
  );

  coverageRow.appendChild(repairLabel);
  coverageRow.appendChild(coverage);

  item.appendChild(header);
  item.appendChild(coverageRow);

  if (showActions) {
    const actions = document.createElement("div");
    actions.className = "flex-between gap-8 armor-actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = armor.worn ? "btn-primary active" : "btn-primary";
    toggleBtn.textContent = armor.worn ? "Remove" : "Wear";
    toggleBtn.addEventListener("click", () => {
      const result = toggleArmor(armor.id);
      if (!result.success) {
        notify(toggleBtn, { message: result.error, type: "error" });
      }
    });

    const discardBtn = document.createElement("button");
    discardBtn.className = "btn-ghost-danger";
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
    item.appendChild(actions);
  }

  container.appendChild(item);
}

export function renderOwnedInventory() {
  const container = document.getElementById("armor-list");
  if (!container) return;

  container.innerHTML = "";

  const owned = getAllOwnedArmor();
  const implants = owned.filter((a) => isImplant(a) && a.worn);
  const regularArmor = owned.filter((a) => !isImplant(a));

  if (owned.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "No armor owned. Visit the store to acquire some.";
    container.appendChild(empty);
    return;
  }

  if (implants.length > 0) {
    const implantGroup = document.createElement("div");
    implantGroup.className = "implant-group";

    const groupLabel = document.createElement("div");
    groupLabel.className = "text-label implant-group-label";
    groupLabel.textContent = "Installed Implants";
    implantGroup.appendChild(groupLabel);

    for (const implant of implants) {
      renderArmorItem(implant, implantGroup, false);
    }

    container.appendChild(implantGroup);
  }

  for (const armor of regularArmor) {
    renderArmorItem(armor, container, true);
  }
}

function openRepairPopover(
  anchor: HTMLElement,
  armorId: string,
  maxSP: number,
  bodyParts: BodyPartName[],
  spByPart: Partial<Record<BodyPartName, number>>,
) {
  let selected: BodyPartName | "all" = "all";
  let sp = getLowestSP(bodyParts, spByPart, maxSP);

  const badgeElements = new Map<BodyPartName, HTMLElement>();

  const getSelectedParts = () => (selected === "all" ? bodyParts : [selected]);

  const updateDisplay = () => {
    const healthClass = getConditionClassFromSP(sp, maxSP);

    spValue.textContent = sp.toString();
    spValue.className = `text-value-2xl repair-sp-value ${healthClass}`;

    popover.className = `popover popover-repair popover-repair-${healthClass}`;

    minusBtn.disabled = sp <= 0;
    plusBtn.disabled = sp >= maxSP;

    for (const [part, badge] of badgeElements) {
      badge.classList.toggle("selected", selected === part);
    }
    allBadge.classList.toggle("selected", selected === "all");
  };

  const selectPart = (part: BodyPartName | "all") => {
    selected = part;
    sp =
      part === "all"
        ? getLowestSP(bodyParts, spByPart, maxSP)
        : (spByPart[part] ?? maxSP);
    updateDisplay();
  };

  const { popover, cleanup, reposition } = createPopover(anchor, {
    className: "popover-repair",
    backdrop: true,
  });

  const partSelector = document.createElement("div");
  partSelector.className = "flex-center gap-4 repair-part-selector";

  for (const part of bodyParts) {
    const badge = document.createElement("button");
    badge.type = "button";
    badge.className = "coverage-badge repair-selectable";
    badge.textContent = PART_ABBREV[part];
    badge.title = part.replace("_", " ");
    badge.addEventListener("click", () => selectPart(part));

    badgeElements.set(part, badge);
    partSelector.appendChild(badge);
  }

  const allBadge = document.createElement("button");
  allBadge.type = "button";
  allBadge.className = "coverage-badge repair-selectable";
  allBadge.textContent = "All";
  allBadge.addEventListener("click", () => selectPart("all"));
  partSelector.appendChild(allBadge);

  const spRow = document.createElement("div");
  spRow.className = "flex-center gap-12 repair-sp-row";

  const minBtn = document.createElement("button");
  minBtn.type = "button";
  minBtn.className = "btn-ghost btn-icon";
  minBtn.textContent = "0";
  minBtn.addEventListener("click", () => {
    sp = 0;
    updateDisplay();
  });

  const minusBtn = document.createElement("button");
  minusBtn.type = "button";
  minusBtn.className = "btn-ghost btn-icon";
  minusBtn.textContent = "−";
  minusBtn.addEventListener("click", () => {
    if (sp > 0) {
      sp--;
      updateDisplay();
    }
  });

  const spValue = document.createElement("span");
  spValue.className = "text-value-2xl repair-sp-value";
  spValue.textContent = sp.toString();

  const plusBtn = document.createElement("button");
  plusBtn.type = "button";
  plusBtn.className = "btn-ghost btn-icon";
  plusBtn.textContent = "+";
  plusBtn.addEventListener("click", () => {
    if (sp < maxSP) {
      sp++;
      updateDisplay();
    }
  });

  const maxBtn = document.createElement("button");
  maxBtn.type = "button";
  maxBtn.className = "btn-ghost btn-icon";
  maxBtn.textContent = maxSP.toString();
  maxBtn.addEventListener("click", () => {
    sp = maxSP;
    updateDisplay();
  });

  spRow.appendChild(minBtn);
  spRow.appendChild(minusBtn);
  spRow.appendChild(spValue);
  spRow.appendChild(plusBtn);
  spRow.appendChild(maxBtn);

  const actions = document.createElement("div");
  actions.className = "popover-actions";

  const dismissBtn = document.createElement("button");
  dismissBtn.className = "popover-btn popover-btn-cancel";
  dismissBtn.textContent = "Dismiss";
  dismissBtn.addEventListener("click", cleanup);

  const applyBtn = document.createElement("button");
  applyBtn.className = "popover-btn popover-btn-confirm";
  applyBtn.textContent = "Apply";
  applyBtn.addEventListener("click", () => {
    const armor = getArmorPiece(armorId);
    const partsArray = getSelectedParts();
    const oldSP = spByPart[partsArray[0]] ?? maxSP;

    if (oldSP !== sp && armor) {
      recordManipulation({
        armorId,
        armorName: armor.name,
        bodyParts: partsArray,
        oldSP,
        newSP: sp,
      });
    }

    setArmorSP(armorId, sp, partsArray);
    cleanup();
  });

  actions.appendChild(dismissBtn);
  actions.appendChild(applyBtn);

  popover.appendChild(partSelector);
  popover.appendChild(spRow);
  popover.appendChild(actions);

  updateDisplay();
  reposition();
}
