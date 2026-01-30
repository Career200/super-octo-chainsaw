import { $REF, setStatInherent, setStatCyber } from "../../../stores/stats";
import type { StatValues } from "../stats";

function createStatColumn(
  name: string,
  shortName: string,
  values: StatValues,
): HTMLElement {
  const col = document.createElement("div");
  col.className = "stat-column";
  col.dataset.stat = shortName.toLowerCase();

  const isDiminished = values.current < values.total;

  col.innerHTML = `
    <div class="stat-name">${name}</div>
    <div class="stat-row stat-inherent">
      <span class="stat-label">Base</span>
      <input type="number" class="stat-input" data-field="inherent" value="${values.inherent}" min="0" max="20">
    </div>
    <div class="stat-row stat-cyber">
      <span class="stat-label">Cyber</span>
      <input type="number" class="stat-input" data-field="cyber" value="${values.cyber}" min="0" max="10">
    </div>
    <div class="stat-row stat-total">
      <span class="stat-label">Total</span>
      <span class="stat-value">${values.total}</span>
    </div>
    <div class="stat-row stat-current ${isDiminished ? "diminished" : ""}">
      <span class="stat-label">Current</span>
      <span class="stat-value">${values.current}</span>
    </div>
  `;

  return col;
}

export function renderStats(): void {
  const container = document.getElementById("stats-panel");
  if (!container) return;

  const ref = $REF.get();

  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "stats-grid";

  grid.appendChild(createStatColumn("REF", "ref", ref));

  container.appendChild(grid);
}

export function setupStats(): void {
  const container = document.getElementById("stats-panel");
  if (!container) return;

  container.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    if (!target.classList.contains("stat-input")) return;

    const column = target.closest(".stat-column");
    if (!column) return;

    const stat = column.getAttribute("data-stat") as "ref";
    const field = target.dataset.field as "inherent" | "cyber";
    const value = parseInt(target.value, 10) || 0;

    if (field === "inherent") {
      setStatInherent(stat, value);
    } else if (field === "cyber") {
      setStatCyber(stat, value);
    }
  });
}
