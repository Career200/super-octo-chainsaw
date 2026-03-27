import { useEffect, useState } from "preact/hooks";

import { Popover } from "@components/charsheet/shared/Popover";
import { isDiceNotation, rollHcDice } from "@scripts/cyber/catalog";

import type { ContainerChoice } from "./hooks/useInstallHelpers";

// --- HC row: name + editable pre-rolled input ---

interface HcRowState {
  key: string;
  name: string;
  notation: string;
  value: number;
}

function initHcRows(
  rows: { key: string; name: string; notation: string }[],
): HcRowState[] {
  return rows.map((r) => ({
    ...r,
    value: isDiceNotation(r.notation)
      ? rollHcDice(r.notation)
      : parseFloat(r.notation) || 0,
  }));
}

function HcRowInputs({
  rows,
  onChange,
}: {
  rows: HcRowState[];
  onChange: (key: string, value: number) => void;
}) {
  if (rows.length === 0) return null;
  return (
    <>
      {rows.map((row) => (
        <div key={row.key} class="cyber-hc-edit">
          <label class="text-soft">{rows.length > 1 ? row.name : "HC"}</label>
          <input
            type="number"
            step="any"
            value={row.value}
            onInput={(e) => {
              const val = parseFloat((e.target as HTMLInputElement).value);
              if (!isNaN(val)) onChange(row.key, val);
            }}
            min={0}
          />
          {isDiceNotation(row.notation) && (
            <span class="text-soft text-sm">({row.notation})</span>
          )}
        </div>
      ))}
    </>
  );
}

// --- Container picker badge row ---

function ContainerPicker({
  containers,
  selected,
  onSelect,
  noContainerHint,
}: {
  containers: ContainerChoice[];
  selected: string | null;
  onSelect: (id: string) => void;
  noContainerHint?: string;
}) {
  if (containers.length === 0) {
    return (
      <p class="text-soft text-sm">
        {noContainerHint ?? "No container available"}
      </p>
    );
  }
  return (
    <>
      <p class="text-soft text-sm" style="margin:0">
        Slot into:
      </p>
      <div class="flex-center gap-4" style="flex-wrap:wrap">
        {containers.map((c) => (
          <button
            key={c.instanceId}
            type="button"
            class={`badge badge-toggle${selected === c.instanceId ? " selected" : ""}`}
            disabled={c.full}
            onClick={() => onSelect(c.instanceId)}
          >
            {c.label}
            {c.full && <span class="text-soft text-xs"> (full)</span>}
            {!c.full && !c.installed && (
              <span class="text-soft text-xs"> (not installed)</span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}

// --- Install popover: container picker + HC rows ---

export function InstallPopover({
  anchorRef,
  open,
  onClose,
  containers,
  noContainerHint,
  blockedHint,
  swapWarning,
  hcRowDefs,
  onConfirm,
  confirmLabel,
}: {
  anchorRef: preact.RefObject<HTMLButtonElement>;
  open: boolean;
  onClose: () => void;
  containers?: ContainerChoice[];
  noContainerHint?: string;
  blockedHint?: string;
  swapWarning?: string;
  hcRowDefs: { key: string; name: string; notation: string }[];
  onConfirm: (
    containerId: string | null,
    hcMap: Record<string, number>,
  ) => void;
  confirmLabel?: string;
}) {
  const [selectedContainer, setSelectedContainer] = useState<string | null>(
    null,
  );
  const [hcRows, setHcRows] = useState<HcRowState[]>([]);

  // Re-init state when popover opens
  useEffect(() => {
    if (!open) return;
    setHcRows(initHcRows(hcRowDefs));
    // Auto-select if exactly one non-full container
    const selectable = containers?.filter((c) => !c.full);
    if (selectable && selectable.length === 1) {
      setSelectedContainer(selectable[0].instanceId);
    } else {
      setSelectedContainer(null);
    }
  }, [open]);

  const updateHc = (key: string, value: number) => {
    setHcRows((prev) => prev.map((r) => (r.key === key ? { ...r, value } : r)));
  };

  const hasContainer = !containers || selectedContainer != null;
  const noContainers = containers != null && containers.every((c) => c.full);

  // When container is uninstalled, option gets no HC (slotted but not installed)
  const selectedIsInstalled =
    selectedContainer != null &&
    containers?.find((c) => c.instanceId === selectedContainer)?.installed !==
      false;
  const showHcRows = hasContainer && (selectedIsInstalled || !containers);

  const buildHcMap = () => {
    const m: Record<string, number> = {};
    for (const r of hcRows) m[r.key] = r.value;
    return m;
  };

  return (
    <Popover anchorRef={anchorRef} open={open} onClose={onClose}>
      {blockedHint ? (
        <p class="text-soft text-sm">{blockedHint}</p>
      ) : (
        <>
          {swapWarning && (
            <p class="text-soft text-sm" style="color:var(--warning)">
              {swapWarning}
            </p>
          )}
          {containers && (
            <ContainerPicker
              containers={containers}
              selected={selectedContainer}
              onSelect={setSelectedContainer}
              noContainerHint={noContainerHint}
            />
          )}
          {showHcRows && <HcRowInputs rows={hcRows} onChange={updateHc} />}
          {!showHcRows && hasContainer && containers && (
            <p class="text-soft text-sm">
              No HC cost until the container is installed.
            </p>
          )}
          <div class="popover-actions">
            <button class="popover-btn popover-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              class="popover-btn popover-btn-confirm"
              disabled={!hasContainer || noContainers}
              onClick={() => onConfirm(selectedContainer, buildHcMap())}
            >
              {confirmLabel ?? "Install"}
            </button>
          </div>
        </>
      )}
    </Popover>
  );
}
