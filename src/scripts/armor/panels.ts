import { BODY_PARTS, getEffectiveSP, getTotalEV } from "./core";
import { getAllOwnedArmor, getBodyPartLayers } from "../../stores/armor";

const PART_LABELS: Record<string, string> = {
  head: "Head",
  torso: "Torso",
  left_arm: "L.Arm",
  right_arm: "R.Arm",
  left_leg: "L.Leg",
  right_leg: "R.Leg",
};

export function renderArmorSummary() {
  const container = document.getElementById("armor-summary");
  if (!container) return;

  container.innerHTML = "";

  for (const part of BODY_PARTS) {
    const layers = getBodyPartLayers(part);
    const total = getEffectiveSP(layers);

    const chip = document.createElement("div");
    chip.className = "summary-chip";

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = PART_LABELS[part] || part;

    const value = document.createElement("span");
    value.className = "value";
    value.textContent = total.toString();

    chip.appendChild(label);
    chip.appendChild(value);
    container.appendChild(chip);
  }

  const wornArmor = getAllOwnedArmor().filter((a) => a.worn);
  const evResult = getTotalEV(getBodyPartLayers, wornArmor);

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
  const countEl = document.getElementById("owned-count");
  const summaryEl = document.getElementById("owned-summary");

  const owned = getAllOwnedArmor();
  const worn = owned.filter((a) => a.worn).length;
  const total = owned.length;

  if (countEl) {
    countEl.textContent = total > 0 ? `${worn}/${total}` : "";
  }

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
