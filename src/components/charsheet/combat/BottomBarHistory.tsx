import { useStore } from "@nanostores/preact";

import {
  $damageHistory,
  clearHistory,
  type DamageHistoryEntry,
  type ManipulationHistoryEntry,
} from "@stores/damage-history";

import { Chevron } from "../shared/Chevron";

import {
  DamageEntry,
  formatBodyParts,
  formatTime,
  ManipulationEntry,
} from "./history-entries";

function DamageSummary({ entry }: { entry: DamageHistoryEntry }) {
  const typeStr =
    entry.damageType !== "normal" ? ` ${entry.damageType.toUpperCase()}` : "";

  const taken = entry.woundDamage ?? entry.penetrating;

  return (
    <span>
      {formatTime(entry.timestamp)}
      {" — "}
      {entry.rawDamage}
      {typeStr}
      {" → "}
      {formatBodyParts(entry.bodyParts)}
      {" — "}
      <span class={taken > 0 ? "history-penetrating" : "history-blocked"}>
        {taken > 0 ? `${taken} taken` : "blocked"}
      </span>
    </span>
  );
}

function ManipulationSummary({ entry }: { entry: ManipulationHistoryEntry }) {
  const delta = entry.newSP - entry.oldSP;
  const label = delta > 0 ? `+${delta} Repair` : `${delta} Break`;

  return (
    <span>
      {formatTime(entry.timestamp)}
      {" — "}
      <span class={delta > 0 ? "history-repair" : "history-break"}>
        {label}
      </span>
      {" — "}
      {entry.armorName}
    </span>
  );
}

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export const BottomBarHistory = ({ expanded, onToggle }: Props) => {
  const history = useStore($damageHistory);
  const lastEntry = history[0];

  return (
    <>
      <div class="bottom-bar-row expandable" onClick={onToggle}>
        <div class="bottom-bar-content">
          {lastEntry ? (
            lastEntry.type === "damage" ? (
              <DamageSummary entry={lastEntry} />
            ) : (
              <ManipulationSummary entry={lastEntry} />
            )
          ) : (
            <span class="bottom-bar-hint">No damage recorded</span>
          )}
        </div>
        <div class="flex-between gap-8">
          {expanded && history.length > 0 && (
            <button
              class="btn-ghost-danger btn-sm"
              onClick={(e: Event) => {
                e.stopPropagation();
                clearHistory();
              }}
            >
              Clear
            </button>
          )}
          <Chevron expanded={expanded} />
        </div>
      </div>
      {expanded && (
        <div class="bottom-bar-body">
          {history.map((entry) =>
            entry.type === "manipulation" ? (
              <ManipulationEntry key={entry.id} entry={entry} />
            ) : (
              <DamageEntry key={entry.id} entry={entry} />
            ),
          )}
        </div>
      )}
    </>
  );
};
