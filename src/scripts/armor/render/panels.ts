import {
  BODY_PARTS,
  PART_ABBREV,
  getEffectiveSP,
  getTotalEV,
} from "../core";
import {
  getAllOwnedArmor,
  getBodyPartLayers,
  getImplantsForPart,
  getInstalledImplants,
  isImplant,
} from "../../../stores/armor";

export function renderArmorSummary() {
  const container = document.getElementById("armor-summary");
  if (!container) return;

  container.innerHTML = "";

  for (const part of BODY_PARTS) {
    const layers = getBodyPartLayers(part);
    const implants = getImplantsForPart(part);

    const total = getEffectiveSP(layers, { implants, part });

    const chip = document.createElement("div");
    chip.className = "summary-chip";

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = PART_ABBREV[part];

    const value = document.createElement("span");
    value.className = "value";
    value.textContent = total.toString();

    chip.appendChild(label);
    chip.appendChild(value);
    container.appendChild(chip);
  }

  const wornArmor = getAllOwnedArmor().filter((a) => a.worn && !isImplant(a));
  const installedImplants = getInstalledImplants();
  const evResult = getTotalEV(wornArmor, installedImplants);

  const evChip = document.createElement("div");
  evChip.className = "summary-chip summary-chip-ev";

  const evLabel = document.createElement("span");
  evLabel.className = "label";
  evLabel.textContent = "EV";

  const evValue = document.createElement("span");
  evValue.className = "value";
  evValue.textContent = evResult.ev.toString();

  evChip.appendChild(evLabel);
  evChip.appendChild(evValue);
  container.appendChild(evChip);
}

export function updateOwnedSummary() {
  const summaryEl = document.getElementById("owned-summary");

  const owned = getAllOwnedArmor();
  const total = owned.length;

  if (summaryEl) {
    summaryEl.innerHTML = "";

    if (total === 0) {
      summaryEl.textContent = "No armor owned";
    } else {
      owned.forEach((armor, i) => {
        const span = document.createElement("span");
        span.className = armor.worn ? "owned-worn" : "owned-stashed";
        span.textContent = armor.name;
        summaryEl.appendChild(span);

        if (i < owned.length - 1) {
          summaryEl.appendChild(document.createTextNode(", "));
        }
      });
    }
  }
}

export function setupCollapsiblePanels() {
  const panels = document.querySelectorAll(".panel-collapsible");

  panels.forEach((panel) => {
    panel.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      if (target.closest("button")) {
        return;
      }

      if (panel.classList.contains("expanded")) {
        if (target.closest(".body-grid, .panel-content")) {
          return;
        }
      }

      panel.classList.toggle("expanded");
    });
  });
}
