import { useStore } from "@nanostores/preact";

import {
  $damageHistory,
  clearHistory,
  type DamageHistoryEntry,
  type ManipulationHistoryEntry,
  undoLatest,
} from "@stores/damage-history";

import { BottomBarShell } from "../common/bottombar/BottomBarShell";
import { ConfirmPopover } from "../shared/ConfirmPopover";
import { usePopoverState } from "../shared/usePopoverState";

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

export default function BottomBarHistory({ expanded, onToggle }: Props) {
  const history = useStore($damageHistory);
  const lastEntry = history[0];
  const {
    ref: clearBtnRef,
    open: confirmOpen,
    setOpen: setConfirmOpen,
  } = usePopoverState();

  return (
    <BottomBarShell
      expanded={expanded}
      onToggle={onToggle}
      headerContent={
        lastEntry ? (
          lastEntry.type === "damage" ? (
            <DamageSummary entry={lastEntry} />
          ) : (
            <ManipulationSummary entry={lastEntry} />
          )
        ) : (
          <span class="bottom-bar-hint">No damage recorded</span>
        )
      }
      actions={
        expanded && history.length > 0 ? (
          <>
            <button
              ref={clearBtnRef}
              class="btn-ghost-danger btn-sm"
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
              message={`Clear ${history.length} entries?`}
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
        ) : undefined
      }
    >
      {history.map((entry, i) =>
        entry.type === "manipulation" ? (
          <ManipulationEntry
            key={entry.id}
            entry={entry}
            onUndo={i === 0 ? undoLatest : undefined}
          />
        ) : (
          <DamageEntry
            key={entry.id}
            entry={entry}
            onUndo={i === 0 ? undoLatest : undefined}
          />
        ),
      )}
    </BottomBarShell>
  );
}
