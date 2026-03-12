import { useStore } from "@nanostores/preact";
import { useEffect, useRef, useState } from "preact/hooks";

import { BottomBarItemShell } from "@components/charsheet/common/bottombar/BottomBarItemShell";
import { ConfirmPopover } from "@components/charsheet/shared/ConfirmPopover";
import { ItemMeta } from "@components/charsheet/shared/ItemMeta";
import { CYBER_CATALOG, type CyberTemplate } from "@scripts/cyber/catalog";
import {
  $hydratedCyber,
  type HydratedCyberItem,
  setItemHc,
} from "@stores/cyber";
import { $selectedCyber } from "@stores/ui";

import { InstallPopover } from "./InstallPopover";
import { useCyberActions } from "./useCyberActions";

// --- Header actions (rendering only) ---

function CyberHeaderActions({
  selectedId,
  ownedItem,
  catalogTemplate,
}: {
  selectedId: string | null;
  ownedItem: HydratedCyberItem | null;
  catalogTemplate: CyberTemplate | null;
}) {
  const popoverBtnRef = useRef<HTMLButtonElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const discardBtnRef = useRef<HTMLButtonElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setPopoverOpen(false);
    setConfirmOpen(false);
  }, [selectedId]);

  const { action, install, discard } = useCyberActions(
    ownedItem,
    catalogTemplate,
  );

  return (
    <>
      {action && (
        <button
          class="bar-action"
          onClick={(e) => {
            e.stopPropagation();
            action.run();
          }}
        >
          {action.label}
        </button>
      )}
      {install && (
        <>
          <button
            ref={popoverBtnRef}
            class="bar-action"
            disabled={install.disabled}
            onClick={(e) => {
              e.stopPropagation();
              setPopoverOpen(true);
            }}
          >
            {install.label}
          </button>
          <InstallPopover
            anchorRef={popoverBtnRef}
            open={popoverOpen}
            onClose={() => setPopoverOpen(false)}
            containers={install.containers}
            noContainerHint={install.noContainerHint}
            hcRowDefs={install.hcRowDefs}
            onConfirm={(containerId, hcMap) => {
              install.onConfirm(containerId, hcMap);
              setPopoverOpen(false);
            }}
            confirmLabel={install.confirmLabel}
          />
        </>
      )}
      {discard && (
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
            message={`Discard ${discard.name}?`}
            confirmText="Discard"
            cancelText="Keep"
            type="danger"
            onConfirm={() => {
              discard.onDiscard();
              setConfirmOpen(false);
            }}
            onCancel={() => setConfirmOpen(false)}
          />
        </>
      )}
    </>
  );
}

// --- Main component ---

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export default function BottomBarCyber({ expanded, onToggle }: Props) {
  const selectedId = useStore($selectedCyber);
  const hydrated = useStore($hydratedCyber);

  // Resolve selection: owned instance or catalog template
  const ownedItem = selectedId
    ? hydrated.find((i) => i.instanceId === selectedId)
    : null;
  const catalogTemplate =
    !ownedItem && selectedId ? CYBER_CATALOG[selectedId] : null;

  const template = ownedItem?.template ?? catalogTemplate;
  const name = template?.name ?? "";
  const hasContent = !!(ownedItem || catalogTemplate);

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
  } else if (template) {
    bodyContent = (
      <>
        <div class="cyber-detail-meta">
          <span class="cyber-item-hc">HC {template.hc}</span>
          <ItemMeta availability={template.availability} cost={template.cost} />
        </div>
        <p class="text-desc">{template.description}</p>
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
      headerActions={
        <CyberHeaderActions
          selectedId={selectedId}
          ownedItem={ownedItem ?? null}
          catalogTemplate={catalogTemplate}
        />
      }
    >
      {bodyContent}
    </BottomBarItemShell>
  );
}
