import { useStore } from "@nanostores/preact";
import { useEffect, useRef, useState } from "preact/hooks";

import { CYBER_CATALOG } from "@scripts/cyber/catalog";
import {
  $hydratedCyber,
  installCyber,
  setItemHc,
  uninstallCyber,
} from "@stores/cyber";
import { $selectedCyber, selectCyber } from "@stores/ui";

import { BottomBarItemShell } from "../common/bottombar/BottomBarItemShell";
import { ConfirmPopover } from "../shared/ConfirmPopover";
import { ItemMeta } from "../shared/ItemMeta";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export default function BottomBarCyber({ expanded, onToggle }: Props) {
  const selectedId = useStore($selectedCyber);
  const hydrated = useStore($hydratedCyber);
  const [rolledNotice, setRolledNotice] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const discardBtnRef = useRef<HTMLButtonElement>(null);

  // Clear rolled notice when selection changes
  useEffect(() => setRolledNotice(null), [selectedId]);

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
    const handleTake = (e: MouseEvent) => {
      e.stopPropagation();
      const result = installCyber(catalogTemplate.id);
      if (result) {
        selectCyber(result.instanceId);
        setRolledNotice(`We rolled ${result.hc} for this implant`);
      }
    };
    headerActions = (
      <button class="bar-action" onClick={handleTake}>
        Take
      </button>
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
      const val = parseInt((e.target as HTMLInputElement).value, 10);
      if (!isNaN(val)) {
        setItemHc(installedItem.instanceId, val);
        setRolledNotice(null);
      }
    };
    bodyContent = (
      <>
        <div class="cyber-hc-edit">
          <label class="text-soft">HC</label>
          <input
            type="number"
            value={installedItem.hc}
            onChange={handleHcChange}
            min={0}
          />
          <span class="text-soft">({installedItem.template.hcDice})</span>
        </div>
        {rolledNotice && <p class="text-soft text-sm">{rolledNotice}</p>}
        <p class="text-desc">{installedItem.template.description}</p>
      </>
    );
  } else if (catalogTemplate) {
    bodyContent = (
      <>
        <div class="cyber-detail-meta">
          <span class="cyber-item-hc">HC {catalogTemplate.hcDice}</span>
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
