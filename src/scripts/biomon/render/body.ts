import { $bodyType } from "@stores/stats";

export function renderBodyInfo(): void {
  const container = document.getElementById("body-info");
  if (!container) return;

  const state = $bodyType.get();

  const btValue = container.querySelector(".body-stat-value");
  const btName = container.querySelector(".body-type-name");
  const btmValue = container.querySelector(".btm-value");
  const carryValue = container.querySelector(".carry-value");
  const saveValue = container.querySelector(".save-value");
  const savePenalty = container.querySelector(".save-penalty");

  if (btValue) btValue.textContent = String(state.value);
  if (btName) btName.textContent = state.name;
  if (btmValue) btmValue.textContent = String(state.btm);
  if (carryValue) carryValue.textContent = `${state.carry}/${state.deadlift}kg`;
  if (saveValue) saveValue.textContent = String(state.currentSave);

  if (savePenalty) {
    if (state.savePenalty < 0) {
      savePenalty.textContent = `(${state.savePenalty})`;
      savePenalty.classList.add("has-penalty");
    } else {
      savePenalty.textContent = "";
      savePenalty.classList.remove("has-penalty");
    }
  }
}
