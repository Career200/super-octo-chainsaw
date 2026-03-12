import { useStore } from "@nanostores/preact";
import { useEffect, useRef, useState } from "preact/hooks";

import {
  CYBER_CATALOG,
  isDiceNotation,
  rollHcDice,
} from "@scripts/cyber/catalog";
import {
  $hydratedCyber,
  installCyber,
  setItemHc,
  uninstallCyber,
} from "@stores/cyber";
import { $selectedCyber, selectCyber } from "@stores/ui";

import { BottomBarItemShell } from "../../common/bottombar/BottomBarItemShell";
import { ConfirmPopover } from "../../shared/ConfirmPopover";
import { ItemMeta } from "../../shared/ItemMeta";
import { Popover } from "../../shared/Popover";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export default function BottomBarCyber({ expanded, onToggle }: Props) {
  const selectedId = useStore($selectedCyber);
  const hydrated = useStore($hydratedCyber);

  // Install popover state
  const takeBtnRef = useRef<HTMLButtonElement>(null);
  const [installOpen, setInstallOpen] = useState(false);
  const [pendingHc, setPendingHc] = useState(0);
  const [rolledValue, setRolledValue] = useState(0);
  const [edited, setEdited] = useState(false);

  // Discard popover state
  const discardBtnRef = useRef<HTMLButtonElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Close popovers when selection changes
  useEffect(() => {
    setInstallOpen(false);
    setConfirmOpen(false);
  }, [selectedId]);

  // Resolve: installed instance (by instanceId) or catalog template (by templateId)
  const installedItem = selectedId
    ? hydrated.find((i) => i.instanceId === selectedId)
    : null;
  const catalogTemplate =
    !installedItem && selectedId ? CYBER_CATALOG[selectedId] : null;

  const name = installedItem?.template.name ?? catalogTemplate?.name ?? "";
  const hasContent = !!(installedItem || catalogTemplate);

  // --- Header actions ---
  let headerActions = null;

  if (catalogTemplate) {
    const needsRoll = isDiceNotation(catalogTemplate.hc);
    const handleTakeClick = (e: MouseEvent) => {
      e.stopPropagation();
      let hc;
      if (needsRoll) {
        hc = rollHcDice(catalogTemplate.hc);
      } else {
        hc = parseFloat(catalogTemplate.hc);
      }
      setRolledValue(hc);
      setPendingHc(hc);
      setEdited(false);
      setInstallOpen(true);
    };
    const handleConfirmInstall = () => {
      const result = installCyber(catalogTemplate.id, { hc: pendingHc });
      if (result) selectCyber(result.instanceId);
      setInstallOpen(false);
    };
    headerActions = (
      <>
        <button ref={takeBtnRef} class="bar-action" onClick={handleTakeClick}>
          Take
        </button>
        <Popover
          anchorRef={takeBtnRef}
          open={installOpen}
          onClose={() => setInstallOpen(false)}
        >
          <p class="popover-message">
            Humanity Cost: <strong>{catalogTemplate.hc}</strong>
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
            <button
              class="popover-btn popover-btn-cancel"
              onClick={() => setInstallOpen(false)}
            >
              Cancel
            </button>
            <button
              class="popover-btn popover-btn-confirm"
              onClick={handleConfirmInstall}
            >
              Install
            </button>
          </div>
        </Popover>
      </>
    );
  } else if (installedItem) {
    headerActions = (
      <>
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
          message={`Discard ${installedItem.template.name}?`}
          confirmText="Discard"
          cancelText="Keep"
          type="danger"
          onConfirm={() => {
            uninstallCyber(installedItem.instanceId);
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

  if (installedItem) {
    const handleHcChange = (e: Event) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      if (!isNaN(val)) setItemHc(installedItem.instanceId, val);
    };
    bodyContent = (
      <>
        <div class="cyber-hc-edit">
          <label class="text-soft">HC</label>
          <input
            type="number"
            step="any"
            value={installedItem.hc}
            onChange={handleHcChange}
            min={0}
          />
          <span class="text-soft">({installedItem.template.hc})</span>
        </div>
        <p class="text-desc">{installedItem.template.description}</p>
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
