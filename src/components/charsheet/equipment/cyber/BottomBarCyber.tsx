import { useStore } from "@nanostores/preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import {
  CYBER_CATALOG,
  isDiceNotation,
  rollHcDice,
} from "@scripts/cyber/catalog";
import {
  $hydratedCyber,
  $ownedCyber,
  discardCyber,
  getContainersForOption,
  installCyber,
  installOwned,
  setItemHc,
  slotOption,
  takeCyber,
  uninstallCyber,
  unslotOption,
} from "@stores/cyber";
import { $homerules } from "@stores/homerules";
import { $selectedCyber, selectCyber } from "@stores/ui";

import { BottomBarItemShell } from "../../common/bottombar/BottomBarItemShell";
import { ConfirmPopover } from "../../shared/ConfirmPopover";
import { ItemMeta } from "../../shared/ItemMeta";
import { Popover } from "../../shared/Popover";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

// --- Resolve effective HC notation (respects tsmFreeHc houserule) ---

const TSM_IDS = ["tsm", "tsm-plus"];

function useEffectiveHc(templateId: string | undefined, rawHc: string): string {
  const rules = useStore($homerules);
  if (rules.tsmFreeHc && templateId && TSM_IDS.includes(templateId)) return "0";
  return rawHc;
}

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

interface ContainerChoice {
  instanceId: string;
  label: string;
  installed: boolean;
}

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
    <div class="flex-center gap-4" style="flex-wrap:wrap">
      {containers.map((c) => (
        <button
          key={c.instanceId}
          type="button"
          class={`badge badge-selectable${selected === c.instanceId ? " selected" : ""}`}
          onClick={() => onSelect(c.instanceId)}
        >
          {c.label}
          {!c.installed && <span class="text-soft text-xs"> (owned)</span>}
        </button>
      ))}
    </div>
  );
}

// --- Install popover: container picker + HC rows ---

function InstallPopover({
  anchorRef,
  open,
  onClose,
  containers,
  noContainerHint,
  hcRowDefs,
  onConfirm,
  confirmLabel,
}: {
  anchorRef: preact.RefObject<HTMLButtonElement>;
  open: boolean;
  onClose: () => void;
  containers?: ContainerChoice[];
  noContainerHint?: string;
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
    // Auto-select if exactly one container
    if (containers && containers.length === 1) {
      setSelectedContainer(containers[0].instanceId);
    } else {
      setSelectedContainer(null);
    }
  }, [open]);

  const updateHc = (key: string, value: number) => {
    setHcRows((prev) => prev.map((r) => (r.key === key ? { ...r, value } : r)));
  };

  const hasContainer = !containers || selectedContainer != null;
  const noContainers = containers && containers.length === 0;

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
        <p class="text-soft text-sm">HC applies when container is installed.</p>
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
    </Popover>
  );
}

// --- Build container choices for an option ---

function useContainerChoices(
  templateId: string | undefined,
): ContainerChoice[] {
  const hydrated = useStore($hydratedCyber);
  return useMemo(() => {
    if (!templateId) return [];
    const available = getContainersForOption(templateId);
    // Count per-template for numbering
    const counts: Record<string, number> = {};
    const total: Record<string, number> = {};
    for (const { container } of available) {
      total[container.templateId] = (total[container.templateId] ?? 0) + 1;
    }
    return available.map(({ container }) => {
      const n = (counts[container.templateId] =
        (counts[container.templateId] ?? 0) + 1);
      const needsNumber = total[container.templateId] > 1;
      return {
        instanceId: container.instanceId,
        label: container.template.name + (needsNumber ? ` #${n}` : ""),
        installed: container.installed,
      };
    });
  }, [templateId, hydrated]);
}

// --- Get children of a container for multi-row HC ---

function getChildHcRows(
  containerId: string,
): { key: string; name: string; notation: string }[] {
  const items = $ownedCyber.get();
  return items
    .filter((i) => i.parentId === containerId)
    .flatMap((i) => {
      const t = CYBER_CATALOG[i.templateId];
      if (!t) return [];
      return [{ key: i.instanceId, name: t.name, notation: t.hc }];
    });
}

// --- Main component ---

export default function BottomBarCyber({ expanded, onToggle }: Props) {
  const selectedId = useStore($selectedCyber);
  const hydrated = useStore($hydratedCyber);

  const installBtnRef = useRef<HTMLButtonElement>(null);
  const [installOpen, setInstallOpen] = useState(false);
  const slotBtnRef = useRef<HTMLButtonElement>(null);
  const [slotOpen, setSlotOpen] = useState(false);
  const discardBtnRef = useRef<HTMLButtonElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Close popovers when selection changes
  useEffect(() => {
    setInstallOpen(false);
    setSlotOpen(false);
    setConfirmOpen(false);
  }, [selectedId]);

  // Resolve selection: owned instance or catalog template
  const ownedItem = selectedId
    ? hydrated.find((i) => i.instanceId === selectedId)
    : null;
  const catalogTemplate =
    !ownedItem && selectedId ? CYBER_CATALOG[selectedId] : null;

  const template = ownedItem?.template ?? catalogTemplate;
  const name = template?.name ?? "";
  const hasContent = !!(ownedItem || catalogTemplate);

  const effectiveHc = useEffectiveHc(template?.id, template?.hc ?? "0");
  const isOption = template?.role === "option";
  const isContainer = template?.role === "container";

  // Container choices for option install/slot
  const containerChoices = useContainerChoices(
    isOption ? template?.id : undefined,
  );
  const noContainerHint = isOption
    ? `Install a ${template?.containerCategory ?? "container"} first`
    : undefined;

  // Children for container install cascade
  const childHcRows = useMemo(() => {
    if (!ownedItem || !isContainer || ownedItem.installed) return [];
    return getChildHcRows(ownedItem.instanceId);
  }, [ownedItem, isContainer]);

  // --- Header actions ---
  let headerActions = null;

  if (catalogTemplate) {
    const handleTake = (e: MouseEvent) => {
      e.stopPropagation();
      const result = takeCyber(catalogTemplate.id);
      if (result) selectCyber(result.instanceId);
    };
    const handleInstall = (
      containerId: string | null,
      hcMap: Record<string, number>,
    ) => {
      const hc = hcMap[catalogTemplate.id];
      const result = installCyber(catalogTemplate.id, {
        hc,
        parentId: containerId ?? undefined,
      });
      if (result) selectCyber(result.instanceId);
      setInstallOpen(false);
    };
    headerActions = (
      <>
        <button class="bar-action" onClick={handleTake}>
          Take
        </button>
        <button
          ref={installBtnRef}
          class="bar-action"
          onClick={(e) => {
            e.stopPropagation();
            setInstallOpen(true);
          }}
        >
          Install
        </button>
        <InstallPopover
          anchorRef={installBtnRef}
          open={installOpen}
          onClose={() => setInstallOpen(false)}
          containers={isOption ? containerChoices : undefined}
          noContainerHint={noContainerHint}
          hcRowDefs={[
            {
              key: catalogTemplate.id,
              name: catalogTemplate.name,
              notation: effectiveHc,
            },
          ]}
          onConfirm={handleInstall}
        />
      </>
    );
  } else if (ownedItem && !ownedItem.installed) {
    const role = ownedItem.template.role;

    if (role === "option" && !ownedItem.parentId) {
      // Owned unslotted option: [Slot] [Discard]
      const handleSlot = (
        containerId: string | null,
        hcMap: Record<string, number>,
      ) => {
        if (!containerId) return;
        const hc = hcMap[ownedItem.instanceId];
        slotOption(ownedItem.instanceId, containerId, hc);
        setSlotOpen(false);
      };
      // Show HC row only when an installed container is picked (handled inside popover)
      headerActions = (
        <>
          <button
            ref={slotBtnRef}
            class="bar-action"
            onClick={(e) => {
              e.stopPropagation();
              setSlotOpen(true);
            }}
          >
            Slot
          </button>
          <InstallPopover
            anchorRef={slotBtnRef}
            open={slotOpen}
            onClose={() => setSlotOpen(false)}
            containers={containerChoices}
            noContainerHint={noContainerHint}
            hcRowDefs={[
              {
                key: ownedItem.instanceId,
                name: ownedItem.template.name,
                notation: effectiveHc,
              },
            ]}
            onConfirm={handleSlot}
            confirmLabel="Slot"
          />
          <DiscardButton
            btnRef={discardBtnRef}
            open={confirmOpen}
            name={ownedItem.template.name}
            onOpen={() => setConfirmOpen(true)}
            onConfirm={() => {
              discardCyber(ownedItem.instanceId);
              selectCyber(null);
              setConfirmOpen(false);
            }}
            onCancel={() => setConfirmOpen(false)}
          />
        </>
      );
    } else if (role === "option" && ownedItem.parentId) {
      // Owned slotted option (in uninstalled container): [Unslot] [Discard]
      headerActions = (
        <>
          <button
            class="bar-action"
            onClick={(e) => {
              e.stopPropagation();
              unslotOption(ownedItem.instanceId);
            }}
          >
            Unslot
          </button>
          <DiscardButton
            btnRef={discardBtnRef}
            open={confirmOpen}
            name={ownedItem.template.name}
            onOpen={() => setConfirmOpen(true)}
            onConfirm={() => {
              discardCyber(ownedItem.instanceId);
              selectCyber(null);
              setConfirmOpen(false);
            }}
            onCancel={() => setConfirmOpen(false)}
          />
        </>
      );
    } else {
      // Owned container or standalone, not installed: [Install] [Discard]
      const allHcRows = [
        {
          key: ownedItem.instanceId,
          name: ownedItem.template.name,
          notation: effectiveHc,
        },
        ...childHcRows,
      ];
      const handleInstall = (
        _containerId: string | null,
        hcMap: Record<string, number>,
      ) => {
        installOwned(ownedItem.instanceId, hcMap);
        setInstallOpen(false);
      };
      headerActions = (
        <>
          <button
            ref={installBtnRef}
            class="bar-action"
            onClick={(e) => {
              e.stopPropagation();
              setInstallOpen(true);
            }}
          >
            Install
          </button>
          <InstallPopover
            anchorRef={installBtnRef}
            open={installOpen}
            onClose={() => setInstallOpen(false)}
            hcRowDefs={allHcRows}
            onConfirm={handleInstall}
          />
          <DiscardButton
            btnRef={discardBtnRef}
            open={confirmOpen}
            name={ownedItem.template.name}
            onOpen={() => setConfirmOpen(true)}
            onConfirm={() => {
              discardCyber(ownedItem.instanceId);
              selectCyber(null);
              setConfirmOpen(false);
            }}
            onCancel={() => setConfirmOpen(false)}
          />
        </>
      );
    }
  } else if (ownedItem && ownedItem.installed) {
    // Installed: [Uninstall] [Discard]
    headerActions = (
      <>
        <button
          class="bar-action"
          onClick={(e) => {
            e.stopPropagation();
            if (isOption) {
              unslotOption(ownedItem.instanceId);
            } else {
              uninstallCyber(ownedItem.instanceId);
            }
          }}
        >
          Uninstall
        </button>
        <DiscardButton
          btnRef={discardBtnRef}
          open={confirmOpen}
          name={ownedItem.template.name}
          onOpen={() => setConfirmOpen(true)}
          onConfirm={() => {
            discardCyber(ownedItem.instanceId);
            selectCyber(null);
            setConfirmOpen(false);
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      </>
    );
  }

  // --- Body content ---
  let bodyContent = null;

  if (ownedItem?.installed) {
    bodyContent = (
      <>
        <div class="cyber-hc-edit">
          <label class="text-soft">HC</label>
          <input
            type="number"
            step="any"
            value={ownedItem.hc}
            onChange={(e) => {
              const val = parseFloat((e.target as HTMLInputElement).value);
              if (!isNaN(val)) setItemHc(ownedItem.instanceId, val);
            }}
            min={0}
          />
          <span class="text-soft">({ownedItem.template.hc})</span>
        </div>
        <p class="text-desc">{ownedItem.template.description}</p>
      </>
    );
  } else if (ownedItem) {
    bodyContent = (
      <>
        <div class="cyber-detail-meta">
          <span class="cyber-item-hc">HC {ownedItem.template.hc}</span>
          <ItemMeta
            availability={ownedItem.template.availability}
            cost={ownedItem.template.cost}
          />
        </div>
        <p class="text-desc">{ownedItem.template.description}</p>
      </>
    );
  } else if (catalogTemplate) {
    bodyContent = (
      <>
        <div class="cyber-detail-meta">
          <span class="cyber-item-hc">HC {catalogTemplate.hc}</span>
          <ItemMeta
            availability={catalogTemplate.availability}
            cost={catalogTemplate.cost}
          />
        </div>
        <p class="text-desc">{catalogTemplate.description}</p>
      </>
    );
  }

  return (
    <BottomBarItemShell
      expanded={expanded}
      onToggle={onToggle}
      headerLabel={name}
      hasContent={hasContent}
      hintText="Select a cyberware item"
      adding={false}
      isCustom={false}
      headerActions={headerActions}
    >
      {bodyContent}
    </BottomBarItemShell>
  );
}

// --- Shared discard button + confirm popover ---

function DiscardButton({
  btnRef,
  open,
  name,
  onOpen,
  onConfirm,
  onCancel,
}: {
  btnRef: preact.RefObject<HTMLButtonElement>;
  open: boolean;
  name: string;
  onOpen: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <button
        ref={btnRef}
        class="bar-action bar-remove"
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        Discard
      </button>
      <ConfirmPopover
        anchorRef={btnRef}
        open={open}
        message={`Discard ${name}?`}
        confirmText="Discard"
        cancelText="Keep"
        type="danger"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </>
  );
}
