import {
  $REF,
  $INT,
  $CL,
  $TECH,
  $LK,
  $ATT,
  $MA,
  $EMP,
  $BT,
  setStatInherent,
  setStatCyber,
} from "@stores/stats";
import {
  STAT_NAMES,
  STAT_LABELS,
  type StatName,
  type StatValues,
} from "@scripts/biomon/types";

function createStatColumn(
  label: string,
  name: StatName,
  values: StatValues,
): HTMLElement {
  const col = document.createElement("div");
  col.className = "stat-column";
  col.dataset.stat = name;

  const isDiminished = values.current < values.total;

  col.innerHTML = `
    <div class="stat-name">${label}</div>
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
    <div class="stat-penalties">${values.penalties.join("")}</div>
    <div class="stat-row stat-current ${isDiminished ? "diminished" : ""}">
      <span class="stat-label">Current</span>
      <span class="stat-value">${values.current}</span>
    </div>
  `;

  return col;
}

const STAT_STORES = {
  ref: $REF,
  int: $INT,
  cl: $CL,
  tech: $TECH,
  lk: $LK,
  att: $ATT,
  ma: $MA,
  emp: $EMP,
  bt: $BT,
} as const;

export function renderStats(): void {
  const container = document.getElementById("stats-panel");
  if (!container) return;

  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "stats-grid";

  for (const name of STAT_NAMES) {
    const values = STAT_STORES[name].get();
    grid.appendChild(createStatColumn(STAT_LABELS[name], name, values));
  }

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

    const stat = column.getAttribute("data-stat") as StatName;
    const field = target.dataset.field as "inherent" | "cyber";
    const value = parseInt(target.value, 10) || 0;

    if (field === "inherent") {
      setStatInherent(stat, value);
    } else if (field === "cyber") {
      setStatCyber(stat, value);
    }
  });
}
