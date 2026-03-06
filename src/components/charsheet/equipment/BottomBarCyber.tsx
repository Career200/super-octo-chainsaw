import { useStore } from "@nanostores/preact";

import { $selectedCyber, selectCyber } from "@stores/ui";

import { BottomBarItemShell } from "../common/bottombar/BottomBarItemShell";

import { MOCK_ALL_ITEMS } from "./cyberMockData";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export default function BottomBarCyber({ expanded, onToggle }: Props) {
  const selectedId = useStore($selectedCyber);
  const item = selectedId
    ? (MOCK_ALL_ITEMS.find((i) => i.id === selectedId) ?? null)
    : null;

  return (
    <BottomBarItemShell
      expanded={expanded}
      onToggle={onToggle}
      headerLabel={item?.name ?? ""}
      hasContent={!!item}
      hintText="Select a cyberware item"
      adding={false}
      isCustom={false}
    >
      {item && (
        <div class="cyber-detail">
          <div class="cyber-detail-meta">
            <span class="cyber-item-hc">HC {item.hc}</span>
          </div>
          <p class="text-desc">{item.description}</p>
          <button
            class="btn-ghost btn-sm"
            onClick={() => selectCyber(null)}
          >
            {item.installed ? "Uninstall" : "Install"}
          </button>
        </div>
      )}
    </BottomBarItemShell>
  );
}
