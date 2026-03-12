import { useStore } from "@nanostores/preact";
import { useEffect, useRef, useState } from "preact/hooks";

import {
  CYBER_CATALOG,
  isDiceNotation,
  rollHcDice,
} from "@scripts/cyber/catalog";
import {
  $hydratedCyber,
  discardCyber,
  installCyber,
  installOwned,
  setItemHc,
  takeCyber,
  uninstallCyber,
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

// --- HC roll popover (shared between catalog Install and owned Install) ---

function InstallPopover({
  anchorRef,
  open,
  hcNotation,
  onConfirm,
  onClose,
}: {
  anchorRef: preact.RefObject<HTMLButtonElement>;
  open: boolean;
  hcNotation: string;
  onConfirm: (hc: number) => void;
  onClose: () => void;
}) {
  const needsRoll = isDiceNotation(hcNotation);
  const [pendingHc, setPendingHc] = useState(0);
  const [rolledValue, setRolledValue] = useState(0);
  const [edited, setEdited] = useState(false);

  // Roll fresh whenever the popover opens
  useEffect(() => {
    if (!open) return;
    const hc = needsRoll ? rollHcDice(hcNotation) : parseFloat(hcNotation);
    setRolledValue(hc);
    setPendingHc(hc);
    setEdited(false);
  }, [open, hcNotation, needsRoll]);

  return (
    <Popover anchorRef={anchorRef} open={open} onClose={onClose}>
      <p class="popover-message">
        Humanity Cost: <strong>{hcNotation}</strong>
      </p>
      <div class="cyber-hc-edit">
        <label class="text-soft">HC</label>
        <input
          type="number"
          step="any"
          value={pendingHc}
          onInput={(e) => {
            const val = parseFloat((e.target as HTMLInputElement).value);
            if (!isNaN(val)) {
              setPendingHc(val);
              setEdited(true);
            }
          }}
          min={0}
        />
      </div>
      {needsRoll && !edited && (
        <p class="text-soft text-sm">
          We rolled {rolledValue} for this implant
        </p>
      )}
      <div class="popover-actions">
        <button class="popover-btn popover-btn-cancel" onClick={onClose}>
          Cancel
        </button>
        <button
          class="popover-btn popover-btn-confirm"
          onClick={() => onConfirm(pendingHc)}
        >
          Install
        </button>
      </div>
    </Popover>
  );
}

// --- Main component ---

export default function BottomBarCyber({ expanded, onToggle }: Props) {
  const selectedId = useStore($selectedCyber);
  const hydrated = useStore($hydratedCyber);

  const installBtnRef = useRef<HTMLButtonElement>(null);
  const [installOpen, setInstallOpen] = useState(false);
  const discardBtnRef = useRef<HTMLButtonElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Close popovers when selection changes
  useEffect(() => {
    setInstallOpen(false);
    setConfirmOpen(false);
  }, [selectedId]);

  // Resolve selection: owned instance or catalog template
  const ownedItem = selectedId
    ? hydrated.find((i) => i.instanceId === selectedId)
    : null;
  const catalogTemplate =
    !ownedItem && selectedId ? CYBER_CATALOG[selectedId] : null;

  const name = ownedItem?.template.name ?? catalogTemplate?.name ?? "";
  const hasContent = !!(ownedItem || catalogTemplate);

  // Free HC houserule: TSM/TSM+ default to 0
  const rules = useStore($homerules);
  const TSM_IDS = ["tsm", "tsm-plus"];
  const templateId = ownedItem?.templateId ?? catalogTemplate?.id;
  const rawHc = ownedItem?.template.hc ?? catalogTemplate?.hc ?? "0";
  const effectiveHc =
    rules.tsmFreeHc && templateId && TSM_IDS.includes(templateId)
      ? "0"
      : rawHc;

  // --- Header actions ---
  let headerActions = null;

  if (catalogTemplate) {
    // Catalog item: [Take] [Install]
    const handleTake = (e: MouseEvent) => {
      e.stopPropagation();
      const result = takeCyber(catalogTemplate.id);
      if (result) selectCyber(result.instanceId);
    };
    const handleInstall = (hc: number) => {
      const result = installCyber(catalogTemplate.id, { hc });
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
          hcNotation={effectiveHc}
          onConfirm={handleInstall}
          onClose={() => setInstallOpen(false)}
        />
      </>
    );
  } else if (ownedItem && !ownedItem.installed) {
    // Owned, not installed: [Install] [Discard]
    const handleInstall = (hc: number) => {
      installOwned(ownedItem.instanceId, hc);
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
          hcNotation={effectiveHc}
          onConfirm={handleInstall}
          onClose={() => setInstallOpen(false)}
        />
        <button
          ref={discardBtnRef}
          class="bar-action bar-remove"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmOpen(true);
          }}
        >
          Discard
        </button>
        <ConfirmPopover
          anchorRef={discardBtnRef}
          open={confirmOpen}
          message={`Discard ${ownedItem.template.name}?`}
          confirmText="Discard"
          cancelText="Keep"
          type="danger"
          onConfirm={() => {
            discardCyber(ownedItem.instanceId);
            selectCyber(null);
            setConfirmOpen(false);
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      </>
    );
  } else if (ownedItem && ownedItem.installed) {
    // Installed: [Uninstall] [Discard]
    headerActions = (
      <>
        <button
          class="bar-action"
          onClick={(e) => {
            e.stopPropagation();
            uninstallCyber(ownedItem.instanceId);
          }}
        >
          Uninstall
        </button>
        <button
          ref={discardBtnRef}
          class="bar-action bar-remove"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmOpen(true);
          }}
        >
          Discard
        </button>
        <ConfirmPopover
          anchorRef={discardBtnRef}
          open={confirmOpen}
          message={`Discard ${ownedItem.template.name}?`}
          confirmText="Discard"
          cancelText="Keep"
          type="danger"
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
