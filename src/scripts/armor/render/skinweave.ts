import {
  $skinWeave,
  setSkinWeaveLevel,
  repairSkinWeave,
  type SkinWeaveLevel,
} from "../../../stores/skinweave";
import { BODY_PARTS } from "../core";
import { getHealthClassFromSP } from "./common";

export function renderSkinWeave(): void {
  const display = document.getElementById("skinweave-display");
  const select = document.getElementById(
    "skinweave-select",
  ) as HTMLSelectElement | null;
  const spDisplay = document.getElementById("skinweave-sp");

  if (!display || !select || !spDisplay) return;

  const state = $skinWeave.get();
  const isInstalled = state.level > 0;

  // Update display state
  display.classList.toggle("installed", isInstalled);

  // Update select value
  select.value = state.level.toString();

  // Update SP display
  if (isInstalled) {
    const minSP = Math.min(...BODY_PARTS.map((p) => state.spByPart[p]));
    const healthClass = getHealthClassFromSP(minSP, state.level);

    // Check if damaged
    const isDamaged = minSP < state.level;

    spDisplay.innerHTML = isDamaged
      ? `<span class="current ${healthClass}">${minSP}</span>/${state.level}`
      : "";

    // Add repair button if damaged
    let repairBtn = display.querySelector(
      ".skinweave-repair",
    ) as HTMLButtonElement | null;
    if (isDamaged && !repairBtn) {
      repairBtn = document.createElement("button");
      repairBtn.className = "skinweave-repair";
      repairBtn.textContent = "Repair";
      repairBtn.addEventListener("click", () => repairSkinWeave());
      display.appendChild(repairBtn);
    } else if (!isDamaged && repairBtn) {
      repairBtn.remove();
    }
  } else {
    spDisplay.innerHTML = "";
    const repairBtn = display.querySelector(".skinweave-repair");
    if (repairBtn) repairBtn.remove();
  }
}

export function setupSkinWeave(): void {
  const select = document.getElementById(
    "skinweave-select",
  ) as HTMLSelectElement | null;
  if (!select) return;

  select.addEventListener("change", () => {
    const level = parseInt(select.value, 10) as SkinWeaveLevel;
    setSkinWeaveLevel(level);
  });

  // Subscribe to changes
  $skinWeave.subscribe(() => {
    renderSkinWeave();
  });

  renderSkinWeave();
}
