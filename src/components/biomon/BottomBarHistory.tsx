import { useStore } from "@nanostores/preact";
import {
  $damageHistory,
  type DamageHistoryEntry,
  type ManipulationHistoryEntry,
} from "@stores/damage-history";
import {
  DamageEntry,
  ManipulationEntry,
  formatTime,
  formatBodyParts,
} from "./history-entries";
import { Chevron } from "@components/shared/Chevron";

function DamageSummary({ entry }: { entry: DamageHistoryEntry }) {
  const typeStr =
    entry.damageType !== "normal" ? ` ${entry.damageType.toUpperCase()}` : "";

  return (
    <span>
      {formatTime(entry.timestamp)}{" — "}
      {entry.rawDamage}{typeStr}
      {" → "}{formatBodyParts(entry.bodyParts)}{" — "}
      <span class={entry.penetrating > 0 ? "history-penetrating" : "history-blocked"}>
        {entry.penetrating > 0 ? `${entry.penetrating} taken` : "blocked"}
      </span>
    </span>
  );
}

function ManipulationSummary({ entry }: { entry: ManipulationHistoryEntry }) {
  const delta = entry.newSP - entry.oldSP;
  const label = delta > 0 ? `+${delta} Repair` : `${delta} Break`;

  return (
    <span>
      {formatTime(entry.timestamp)}{" — "}
      <span class={delta > 0 ? "history-repair" : "history-break"}>{label}</span>
      {" — "}{entry.armorName}
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
        <Chevron expanded={expanded} />
      </div>
      {expanded && (
        <div class="bottom-bar-body">
          {/* TODO: clear history button */}
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
