import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";

import { CYBER_CATALOG } from "@scripts/cyber/catalog";
import {
  $hydratedCyber,
  installCyber,
  setItemHc,
  uninstallCyber,
} from "@stores/cyber";
import { $selectedCyber, selectCyber } from "@stores/ui";

import { BottomBarItemShell } from "../common/bottombar/BottomBarItemShell";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export default function BottomBarCyber({ expanded, onToggle }: Props) {
  const selectedId = useStore($selectedCyber);
  const hydrated = useStore($hydratedCyber);
  const [editingHc, setEditingHc] = useState(false);

  // Try installed first (by instanceId), then catalog (by templateId)
  const installedItem = selectedId
    ? hydrated.find((i) => i.instanceId === selectedId)
    : null;
  const catalogTemplate =
    !installedItem && selectedId ? CYBER_CATALOG[selectedId] : null;

  const name = installedItem?.template.name ?? catalogTemplate?.name ?? "";
  const hasContent = !!(installedItem || catalogTemplate);

  const handleInstall = () => {
    if (!catalogTemplate) return;
    const result = installCyber(catalogTemplate.id);
    if (result) selectCyber(result.instanceId);
  };

  const handleUninstall = () => {
    if (!installedItem) return;
    uninstallCyber(installedItem.instanceId);
    selectCyber(null);
  };

  const handleHcChange = (e: Event) => {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    if (!isNaN(val) && installedItem) {
      setItemHc(installedItem.instanceId, val);
    }
    setEditingHc(false);
  };

  return (
    <BottomBarItemShell
      expanded={expanded}
      onToggle={onToggle}
      headerLabel={name}
      hasContent={hasContent}
      hintText="Select a cyberware item"
      adding={false}
      isCustom={false}
    >
      {installedItem && (
        <div class="cyber-detail">
          <div class="cyber-detail-meta">
            {editingHc ? (
              <input
                type="number"
                class="inline-input"
                value={installedItem.hc}
                onBlur={handleHcChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleHcChange(e);
                }}
                autoFocus
              />
            ) : (
              <span
                class="cyber-item-hc"
                onClick={() => setEditingHc(true)}
                title="Click to edit HC"
              >
                HC {installedItem.hc}
              </span>
            )}
          </div>
          <p class="text-desc">{installedItem.template.description}</p>
          <button class="btn-ghost btn-sm" onClick={handleUninstall}>
            Uninstall
          </button>
        </div>
      )}
      {catalogTemplate && (
        <div class="cyber-detail">
          <div class="cyber-detail-meta">
            <span class="cyber-item-hc">HC {catalogTemplate.hcDice}</span>
          </div>
          <p class="text-desc">{catalogTemplate.description}</p>
          <button class="btn-ghost btn-sm" onClick={handleInstall}>
            Install
          </button>
        </div>
      )}
    </BottomBarItemShell>
  );
}
