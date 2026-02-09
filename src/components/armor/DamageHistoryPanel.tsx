import { useState, useRef } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  $damageHistory,
  clearHistory,
  type DamageHistoryEntry,
  type ManipulationHistoryEntry,
  type HistoryEntry,
} from "@stores/damage-history";
import { getArmorPiece } from "@stores/armor";
import { PART_NAMES, type BodyPartName } from "@scripts/armor/core";
import { Panel } from "@components/shared/Panel";
import { ConfirmPopover } from "@components/shared/ConfirmPopover";
import { getConditionClassFromSP } from "./utils";

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBodyParts(parts: BodyPartName[] | "none"): string {
  if (parts === "none") return "Non-local";
  if (parts.length === 6) return "Full Body";
  return parts.map((p) => PART_NAMES[p]).join(", ");
}

const DamageEntry = ({ entry }: { entry: DamageHistoryEntry }) => {
  const typeStr =
    entry.damageType !== "normal" ? ` ${entry.damageType.toUpperCase()}` : "";

  return (
    <div class="history-entry history-entry-damage">
      <div class="flex-between-baseline history-header">
        <span class="text-desc history-time">{formatTime(entry.timestamp)}</span>
        <span class="history-damage">
          {entry.rawDamage}
          {typeStr}
        </span>
      </div>
      <div class="history-details">
        <div class="text-soft history-line">
          <span class="history-label">Location:</span>{" "}
          {formatBodyParts(entry.bodyParts)}
        </div>
        {entry.effectiveSP > 0 && !entry.ignoredArmor && (
          <div class="text-soft history-line">
            <span class="history-label">SP:</span> {entry.effectiveSP} blocked
          </div>
        )}
        {entry.ignoredArmor && (
          <div class="history-line history-ignored">
            <span class="history-label">SP:</span> ignored
          </div>
        )}
        {entry.topProtector && entry.effectiveSP > 0 && (
          <div class="text-soft history-line">
            <span class="history-label">Protected by:</span> {entry.topProtector}
          </div>
        )}
        {entry.armorDamage.length > 0 && (
          <div class="text-soft history-line">
            <span class="history-label">Armor:</span>{" "}
            {entry.armorDamage.map((a) => `${a.armorName} -${a.spLost}`).join(", ")}
          </div>
        )}
        <div
          class={`history-line ${entry.penetrating > 0 ? "history-penetrating" : "history-blocked"}`}
        >
          <span class="history-label">Taken:</span> {entry.penetrating}
        </div>
      </div>
    </div>
  );
};

const ManipulationEntry = ({ entry }: { entry: ManipulationHistoryEntry }) => {
  const armor = getArmorPiece(entry.armorId);
  const maxSP = armor?.spMax ?? entry.newSP;
  const conditionClass = getConditionClassFromSP(entry.newSP, maxSP);

  const delta = entry.newSP - entry.oldSP;
  const label = delta > 0 ? `+${delta} Repair` : `${delta} Break`;
  const labelClass = delta > 0 ? "history-repair" : "history-break";

  return (
    <div class={`history-entry history-entry-manipulation ${conditionClass}`}>
      <div class="flex-between-baseline history-header">
        <span class="text-desc history-time">{formatTime(entry.timestamp)}</span>
        <span class={labelClass}>{label}</span>
      </div>
      <div class="history-details">
        <div class="text-soft history-line">
          <span class="history-label">Armor:</span> {entry.armorName}
        </div>
        <div class="text-soft history-line">
          <span class="history-label">Parts:</span>{" "}
          {formatBodyParts(entry.bodyParts)}
        </div>
        <div class="text-soft history-line">
          <span class="history-label">SP:</span> {entry.oldSP} → {entry.newSP}
        </div>
      </div>
    </div>
  );
};

export const DamageHistoryPanel = () => {
  const history = useStore($damageHistory);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const clearBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <Panel
      id="damage-history-panel"
      title="Damage History"
      headerActions={
        <>
          <button
            ref={clearBtnRef}
            class="btn-ghost-danger btn-md"
            onClick={(e: Event) => {
              e.stopPropagation();
              setConfirmOpen(true);
            }}
          >
            Clear
          </button>
          <ConfirmPopover
            anchorRef={clearBtnRef}
            open={confirmOpen}
            message="Clear all damage history?"
            confirmText="Clear"
            cancelText="Keep"
            type="danger"
            onConfirm={() => {
              clearHistory();
              setConfirmOpen(false);
            }}
            onCancel={() => setConfirmOpen(false)}
          />
        </>
      }
    >
      {history.length === 0 ? (
        <p class="empty-message">No damage recorded yet.</p>
      ) : (
        history.map((entry: HistoryEntry) =>
          entry.type === "manipulation" ? (
            <ManipulationEntry key={entry.id} entry={entry} />
          ) : (
            <DamageEntry key={entry.id} entry={entry} />
          ),
        )
      )}
    </Panel>
  );
};
