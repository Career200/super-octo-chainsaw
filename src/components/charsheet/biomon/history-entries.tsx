import type { DamageHistoryEntry, ManipulationHistoryEntry } from "@stores/damage-history";
import { getArmorPiece } from "@stores/armor";
import { PART_NAMES, type BodyPartName } from "@scripts/armor/core";
import { getConditionClassFromSP } from "../equipment/utils";

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBodyParts(parts: BodyPartName[] | "none"): string {
  if (parts === "none") return "Non-local";
  if (parts.length === 6) return "Full Body";
  return parts.map((p) => PART_NAMES[p]).join(", ");
}

export const DamageEntry = ({ entry }: { entry: DamageHistoryEntry }) => {
  const typeStr =
    entry.damageType !== "normal" ? ` ${entry.damageType.toUpperCase()}` : "";

  return (
    <div class="history-entry history-entry-damage">
      <div class="history-header">
        <span class="history-time">{formatTime(entry.timestamp)}</span>
        <span class="history-damage">
          {entry.rawDamage}
          {typeStr}
        </span>
      </div>
      <div class="history-details">
        <span class="history-detail">
          <span class="history-label">Location:</span> {formatBodyParts(entry.bodyParts)}
        </span>
        {entry.effectiveSP > 0 && !entry.ignoredArmor && (
          <span class="history-detail">
            <span class="history-label">SP:</span> {entry.effectiveSP} blocked
          </span>
        )}
        {entry.ignoredArmor && (
          <span class="history-detail history-ignored">
            <span class="history-label">SP:</span> ignored
          </span>
        )}
        {entry.topProtector && entry.effectiveSP > 0 && (
          <span class="history-detail">
            <span class="history-label">Protected by:</span> {entry.topProtector}
          </span>
        )}
        {entry.armorDamage.length > 0 && (
          <span class="history-detail">
            <span class="history-label">Armor:</span>{" "}
            {entry.armorDamage.map((a) => `${a.armorName} -${a.spLost}`).join(", ")}
          </span>
        )}
        <span class={`history-detail ${entry.penetrating > 0 ? "history-penetrating" : "history-blocked"}`}>
          <span class="history-label">Taken:</span> {entry.penetrating}
        </span>
      </div>
    </div>
  );
};

export const ManipulationEntry = ({ entry }: { entry: ManipulationHistoryEntry }) => {
  const armor = getArmorPiece(entry.armorId);
  const maxSP = armor?.spMax ?? entry.newSP;
  const conditionClass = getConditionClassFromSP(entry.newSP, maxSP);

  const delta = entry.newSP - entry.oldSP;
  const label = delta > 0 ? `+${delta} Repair` : `${delta} Break`;
  const labelClass = delta > 0 ? "history-repair" : "history-break";

  return (
    <div class={`history-entry history-entry-manipulation ${conditionClass}`}>
      <div class="history-header">
        <span class="history-time">{formatTime(entry.timestamp)}</span>
        <span class={labelClass}>{label}</span>
      </div>
      <div class="history-details">
        <span class="history-detail">
          <span class="history-label">Armor:</span> {entry.armorName}
        </span>
        <span class="history-detail">
          <span class="history-label">Parts:</span> {formatBodyParts(entry.bodyParts)}
        </span>
        <span class="history-detail">
          <span class="history-label">SP:</span> {entry.oldSP} → {entry.newSP}
        </span>
      </div>
    </div>
  );
};
