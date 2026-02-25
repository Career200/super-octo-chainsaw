import { type BodyPartName, PART_NAMES } from "@scripts/armor/core";
import { getArmorPiece } from "@stores/armor";
import type {
  DamageHistoryEntry,
  ManipulationHistoryEntry,
} from "@stores/damage-history";

import { getConditionClassFromSP } from "../equipment/utils";

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBodyParts(parts: BodyPartName[] | "none"): string {
  if (parts === "none") return "Non-local";
  if (parts.length === 7) return "Full Body";
  return parts.map((p) => PART_NAMES[p]).join(", ");
}

const LIMBS: BodyPartName[] = [
  "right_arm",
  "left_arm",
  "right_leg",
  "left_leg",
];

function getSpecialWoundNote(entry: DamageHistoryEntry): string | null {
  const dmg = entry.woundDamage ?? entry.penetrating;
  if (dmg <= 8 || entry.bodyParts === "none") return null;
  const parts = entry.bodyParts;
  if (parts.includes("head") || parts.includes("face"))
    return "Lethal head wound. You're dead.";
  if (parts.some((p) => LIMBS.includes(p)))
    return "Limb loss — Death Save at Mortal 0 or higher.";
  return null;
}

export const DamageEntry = ({
  entry,
  onUndo,
}: {
  entry: DamageHistoryEntry;
  onUndo?: () => void;
}) => {
  const typeStr =
    entry.damageType !== "normal" ? ` ${entry.damageType.toUpperCase()}` : "";
  const blocked = entry.penetrating === 0 && !entry.ignoredArmor;
  const specialWound = getSpecialWoundNote(entry);

  return (
    <div class="history-entry history-entry-damage">
      <div class="history-header">
        <span class="history-time">{formatTime(entry.timestamp)}</span>
      </div>
      <div class="flex-between">
        <div class="history-details">
          <span class="history-detail history-damage">
            {entry.diceRolls
              ? `${entry.rawDamage} = ${entry.diceRolls.join("+")}`
              : entry.rawDamage}
            {typeStr}
          </span>
          {entry.effectiveSP > 0 && !entry.ignoredArmor && (
            <span class="history-detail">
              <span class="history-label">SP:</span> {entry.effectiveSP}
            </span>
          )}
          {entry.ignoredArmor && (
            <span class="history-detail history-ignored">
              <span class="history-label">SP:</span> ignored
            </span>
          )}
          {blocked && (
            <>
              {entry.topProtector ? (
                <span class="history-detail history-blocked">
                  <span class="history-label">Blocked by</span>{" "}
                  {entry.topProtector}
                </span>
              ) : (
                <span class="history-detail history-blocked">Blocked</span>
              )}
              <span class="history-detail">
                {formatBodyParts(entry.bodyParts)}
              </span>
            </>
          )}
          {!blocked && (
            <>
              {entry.armorDamage.length > 0 && (
                <span class="history-detail">
                  <span class="history-label">Armor:</span>{" "}
                  {entry.armorDamage
                    .map((a) => `${a.armorName} -${a.spLost}`)
                    .join(", ")}
                </span>
              )}
              {entry.btm != null && entry.btm > 0 && (
                <span class="history-detail">
                  <span class="history-label">BTM</span> {"\u2212"}
                  {entry.btm}
                </span>
              )}
              <span class="history-detail">
                <span class="history-label">
                  {formatBodyParts(entry.bodyParts)}
                  {entry.headMultiplied ? " \u00d72" : ""}:
                </span>{" "}
                <span class="history-penetrating">
                  {entry.woundDamage ?? entry.penetrating}
                </span>
              </span>
            </>
          )}
        </div>
        {onUndo && (
          <button class="btn-ghost btn-sm" onClick={onUndo}>
            Undo
          </button>
        )}
      </div>
      {specialWound && <div class="history-special-wound">{specialWound}</div>}
    </div>
  );
};

export const ManipulationEntry = ({
  entry,
  onUndo,
}: {
  entry: ManipulationHistoryEntry;
  onUndo?: () => void;
}) => {
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
        {onUndo && (
          <button class="btn-ghost btn-sm" onClick={onUndo}>
            Undo
          </button>
        )}
      </div>
      <div class="history-details">
        <span class="history-detail">
          <span class="history-label">Armor:</span> {entry.armorName}
        </span>
        <span class="history-detail">
          <span class="history-label">Parts:</span>{" "}
          {formatBodyParts(entry.bodyParts)}
        </span>
        <span class="history-detail">
          <span class="history-label">SP:</span> {entry.oldSP} → {entry.newSP}
        </span>
      </div>
    </div>
  );
};
