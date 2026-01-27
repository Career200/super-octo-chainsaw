import { PART_NAMES, type BodyPartName } from "../core";
import {
  $damageHistory,
  clearHistory,
  type DamageHistoryEntry,
} from "../../../stores/damage-history";
import { confirm } from "../../ui/popover";

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatBodyParts(parts: BodyPartName[] | "none"): string {
  if (parts === "none") return "Non-local";
  if (parts.length === 6) return "Full Body";
  return parts.map((p) => PART_NAMES[p]).join(", ");
}

function renderHistoryEntry(entry: DamageHistoryEntry): HTMLElement {
  const item = document.createElement("div");
  item.className = "history-entry";

  const header = document.createElement("div");
  header.className = "history-header";

  const time = document.createElement("span");
  time.className = "history-time";
  time.textContent = formatTime(entry.timestamp);

  const damage = document.createElement("span");
  damage.className = "history-damage";
  const typeStr = entry.damageType !== "normal" ? ` ${entry.damageType.toUpperCase()}` : "";
  damage.textContent = `${entry.rawDamage}${typeStr}`;

  header.appendChild(time);
  header.appendChild(damage);

  const details = document.createElement("div");
  details.className = "history-details";

  // Location
  const location = document.createElement("div");
  location.className = "history-line";
  location.innerHTML = `<span class="history-label">Location:</span> ${formatBodyParts(entry.bodyParts)}`;
  details.appendChild(location);

  // SP blocked (if any)
  if (entry.effectiveSP > 0 && !entry.ignoredArmor) {
    const spBlocked = document.createElement("div");
    spBlocked.className = "history-line";
    spBlocked.innerHTML = `<span class="history-label">SP:</span> ${entry.effectiveSP} blocked`;
    details.appendChild(spBlocked);
  } else if (entry.ignoredArmor) {
    const ignored = document.createElement("div");
    ignored.className = "history-line history-ignored";
    ignored.innerHTML = `<span class="history-label">SP:</span> ignored`;
    details.appendChild(ignored);
  }

  // Armor degradation
  if (entry.armorDamage.length > 0) {
    const armorLine = document.createElement("div");
    armorLine.className = "history-line";
    const armorStr = entry.armorDamage
      .map((a) => `${a.armorName} -${a.spLost}`)
      .join(", ");
    armorLine.innerHTML = `<span class="history-label">Armor:</span> ${armorStr}`;
    details.appendChild(armorLine);
  }

  // Penetrating damage
  const penetrating = document.createElement("div");
  penetrating.className = `history-line ${entry.penetrating > 0 ? "history-penetrating" : "history-blocked"}`;
  penetrating.innerHTML = `<span class="history-label">Taken:</span> ${entry.penetrating}`;
  details.appendChild(penetrating);

  item.appendChild(header);
  item.appendChild(details);

  return item;
}

export function renderHistory(): void {
  const container = document.getElementById("damage-history-list");
  if (!container) return;

  container.innerHTML = "";

  const history = $damageHistory.get();

  if (history.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "No damage recorded yet.";
    container.appendChild(empty);
    return;
  }

  for (const entry of history) {
    container.appendChild(renderHistoryEntry(entry));
  }
}

export function setupHistoryClear(): void {
  const btn = document.getElementById("btn-clear-history");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const confirmed = await confirm(btn as HTMLElement, {
      message: "Clear all damage history?",
      confirmText: "Clear",
      cancelText: "Keep",
      type: "danger",
    });
    if (confirmed) {
      clearHistory();
    }
  });
}

// Subscribe to history changes
$damageHistory.subscribe(() => {
  renderHistory();
  updateHistoryCount();
});

function updateHistoryCount(): void {
  const countEl = document.getElementById("history-count");
  if (!countEl) return;

  const count = $damageHistory.get().length;
  countEl.textContent = count > 0 ? `(${count})` : "";
}

export function initHistory(): void {
  renderHistory();
  setupHistoryClear();
  updateHistoryCount();
}
