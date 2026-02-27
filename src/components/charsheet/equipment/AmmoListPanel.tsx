import { useStore } from "@nanostores/preact";
import { useRef, useState } from "preact/hooks";

import type { AmmoTemplate } from "@scripts/ammo/catalog";
import { AMMO_CATALOG } from "@scripts/ammo/catalog";
import { WEAPON_CATALOG } from "@scripts/weapons/catalog";
import {
  $allOwnedAmmo,
  $customAmmoList,
  $ownedAmmo,
} from "@stores/ammo";
import {
  $selectedAmmo,
  $selectedWeapon,
  startAddingAmmo,
  tabStore,
} from "@stores/ui";
import { $allOwnedWeapons } from "@stores/weapons";

import { Chevron } from "../shared/Chevron";
import { Panel } from "../shared/Panel";
import { TabStrip } from "../shared/TabStrip";

import { AmmoCard } from "./AmmoCard";

// --- Grouping by caliber ---

type AmmoItem = {
  id: string;
  template: AmmoTemplate;
  quantity: number;
  custom?: boolean;
};

function groupByCaliber(items: AmmoItem[]): [string, AmmoItem[]][] {
  const grouped = new Map<string, AmmoItem[]>();
  for (const item of items) {
    const cal = item.template.caliber;
    if (!grouped.has(cal)) grouped.set(cal, []);
    grouped.get(cal)!.push(item);
  }
  return [...grouped.entries()];
}

function CaliberGroup({
  label,
  collapsed,
  onToggle,
  items,
  selectedId,
  highlightedCaliber,
}: {
  label: string;
  collapsed: boolean;
  onToggle: () => void;
  items: AmmoItem[];
  selectedId: string | null;
  highlightedCaliber: string | null;
}) {
  const isHighlighted = highlightedCaliber === label;
  const groupRef = useRef<HTMLDivElement>(null);
  const wasHighlighted = useRef(false);
  if (isHighlighted && !wasHighlighted.current && groupRef.current) {
    groupRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  wasHighlighted.current = isHighlighted;
  return (
    <div
      ref={groupRef}
      class={`gear-group${isHighlighted ? " gear-group-highlighted" : ""}`}
    >
      <div class="gear-group-label" onClick={onToggle}>
        <span>
          {label}
          <span class="gear-group-count">{items.length}</span>
        </span>
        <Chevron expanded={!collapsed} />
      </div>
      {collapsed ? (
        <>
          <AmmoCard
            template={items[0].template}
            quantity={items[0].quantity}
            custom={items[0].custom}
            selected={selectedId === items[0].id}
            highlighted={isHighlighted}
          />
          {items.length > 1 && (
            <div class="gear-group-more" onClick={onToggle}>
              +{items.length - 1} more
            </div>
          )}
        </>
      ) : (
        items.map((item) => (
          <AmmoCard
            key={item.id}
            template={item.template}
            quantity={item.quantity}
            custom={item.custom}
            selected={selectedId === item.id}
            highlighted={isHighlighted}
          />
        ))
      )}
    </div>
  );
}

// --- Main panel ---

const catalogItems = Object.values(AMMO_CATALOG);

export const AmmoListPanel = ({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) => {
  const ammoState = useStore($ownedAmmo);
  const ownedAmmo = useStore($allOwnedAmmo);
  const customAmmo = useStore($customAmmoList);
  const selectedId = useStore($selectedAmmo);
  const tab = useStore(tabStore("ammo-tab", "catalog"));
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Cross-highlighting: derive caliber from selected weapon (catalog or owned)
  const selectedWeaponId = useStore($selectedWeapon);
  const allWeapons = useStore($allOwnedWeapons);
  const highlightedCaliber =
    selectedWeaponId != null
      ? (WEAPON_CATALOG[selectedWeaponId]?.ammo ??
        allWeapons.find((w) => w.id === selectedWeaponId)?.ammo ??
        null)
      : null;

  const toggleGroup = (caliber: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(caliber)) next.delete(caliber);
      else next.add(caliber);
      return next;
    });
  };

  // Catalog view
  const catalogGroups = groupByCaliber(
    catalogItems.map((t) => ({
      id: t.templateId,
      template: t,
      quantity: ammoState[t.templateId] ?? 0,
    })),
  );

  // Owned view
  const ownedGroups = groupByCaliber(
    ownedAmmo.map((item) => ({
      id: item.templateId,
      template: item,
      quantity: item.quantity,
      custom: item.custom,
    })),
  );

  // Custom view
  const customGroups = groupByCaliber(
    customAmmo.map((item) => ({
      id: item.templateId,
      template: item,
      quantity: item.quantity,
      custom: true,
    })),
  );

  return (
    <Panel
      id="ammo-panel"
      title="Ammo"
      expanded={expanded}
      onToggle={onToggle}
      headerActions={
        <TabStrip
          persist="ammo-tab"
          tabs={[
            { id: "catalog", label: "Catalog" },
            {
              id: "custom",
              label: `Custom${customAmmo.length > 0 ? ` ${customAmmo.length}` : ""}`,
            },
            {
              id: "owned",
              label: `Owned${ownedAmmo.length > 0 ? ` ${ownedAmmo.length}` : ""}`,
            },
          ]}
        />
      }
    >
      {tab === "custom" && (
        <div class="gear-toolbar">
          <button class="btn-sm gear-add-btn" onClick={() => startAddingAmmo()}>
            + Add Custom
          </button>
        </div>
      )}

      <div class="gear-grid">
        {tab === "catalog" &&
          catalogGroups.map(([caliber, items]) => (
            <CaliberGroup
              key={caliber}
              label={caliber}
              collapsed={collapsed.has(caliber)}
              onToggle={() => toggleGroup(caliber)}
              items={items}
              selectedId={selectedId}
              highlightedCaliber={highlightedCaliber}
            />
          ))}
        {tab === "custom" &&
          (customGroups.length > 0 ? (
            customGroups.map(([caliber, items]) => (
              <CaliberGroup
                key={caliber}
                label={caliber}
                collapsed={collapsed.has(caliber)}
                onToggle={() => toggleGroup(caliber)}
                items={items}
                selectedId={selectedId}
                highlightedCaliber={highlightedCaliber}
              />
            ))
          ) : (
            <div class="empty-message">No custom ammo yet</div>
          ))}
        {tab === "owned" &&
          (ownedGroups.length > 0 ? (
            ownedGroups.map(([caliber, items]) => (
              <CaliberGroup
                key={caliber}
                label={caliber}
                collapsed={collapsed.has(caliber)}
                onToggle={() => toggleGroup(caliber)}
                items={items}
                selectedId={selectedId}
                highlightedCaliber={highlightedCaliber}
              />
            ))
          ) : (
            <div class="empty-message">
              No ammo yet. Browse the Catalog to add some.
            </div>
          ))}
      </div>
    </Panel>
  );
};
