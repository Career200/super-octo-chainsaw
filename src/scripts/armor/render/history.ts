import { PART_NAMES, type BodyPartName } from "../core";
import {
  $damageHistory,
  clearHistory,
  type DamageHistoryEntry,
  type ManipulationHistoryEntry,
  type HistoryEntry,
} from "../../../stores/damage-history";
import { getArmorPiece } from "../../../stores/armor";
import { confirm } from "../../ui/popover";
import { getHealthClassFromSP } from "./common";

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatBodyParts(parts: BodyPartName[] | "none"): string {
  if (parts === "none") return "Non-local";
  if (parts.length === 6) return "Full Body";
  return parts.map((p) => PART_NAMES[p]).join(", ");
}

function renderDamageEntry(entry: DamageHistoryEntry): HTMLElement {
  const item = document.createElement("div");
  item.className = "history-entry history-entry-damage";

  const header = document.createElement("div");
  header.className = "history-header";

  const time = document.createElement("span");
  time.className = "history-time";
  time.textContent = formatTime(entry.timestamp);

  const damage = document.createElement("span");
  damage.className = "history-damage";
  const typeStr =
    entry.damageType !== "normal" ? ` ${entry.damageType.toUpperCase()}` : "";
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

  // Top protector (which armor saved you)
  if (entry.topProtector && entry.effectiveSP > 0) {
    const protectorLine = document.createElement("div");
    protectorLine.className = "history-line";
    protectorLine.innerHTML = `<span class="history-label">Protected by:</span> ${entry.topProtector}`;
    details.appendChild(protectorLine);
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

function renderManipulationEntry(entry: ManipulationHistoryEntry): HTMLElement {
  const armor = getArmorPiece(entry.armorId);
  const maxSP = armor?.spMax ?? entry.newSP;
  const healthClass = getHealthClassFromSP(entry.newSP, maxSP);

  const item = document.createElement("div");
  item.className = `history-entry history-entry-manipulation ${healthClass}`;

  const header = document.createElement("div");
  header.className = "history-header";

  const time = document.createElement("span");
  time.className = "history-time";
  time.textContent = formatTime(entry.timestamp);

  const delta = entry.newSP - entry.oldSP;
  const label = document.createElement("span");
  label.className = delta > 0 ? "history-repair" : "history-break";
  label.textContent = delta > 0 ? `+${delta} Repair` : `${delta} Break`;

  header.appendChild(time);
  header.appendChild(label);

  const details = document.createElement("div");
  details.className = "history-details";

  const armorLine = document.createElement("div");
  armorLine.className = "history-line";
  armorLine.innerHTML = `<span class="history-label">Armor:</span> ${entry.armorName}`;
  details.appendChild(armorLine);

  const partsLine = document.createElement("div");
  partsLine.className = "history-line";
  partsLine.innerHTML = `<span class="history-label">Parts:</span> ${formatBodyParts(entry.bodyParts)}`;
  details.appendChild(partsLine);

  const spLine = document.createElement("div");
  spLine.className = "history-line";
  spLine.innerHTML = `<span class="history-label">SP:</span> ${entry.oldSP} → ${entry.newSP}`;
  details.appendChild(spLine);

  item.appendChild(header);
  item.appendChild(details);

  return item;
}

function renderHistoryEntry(entry: HistoryEntry): HTMLElement {
  if (entry.type === "manipulation") {
    return renderManipulationEntry(entry);
  }
  return renderDamageEntry(entry);
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
});

export function initHistory(): void {
  renderHistory();
  setupHistoryClear();
}
