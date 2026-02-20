import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";

import type { WeaponTemplate, WeaponType } from "@scripts/weapons/catalog";
import { WEAPON_CATALOG, WEAPON_TYPE_LABELS } from "@scripts/weapons/catalog";
import {
  $selectedWeapon,
  selectWeapon,
  startAddingWeapon,
  tabStore,
} from "@stores/ui";
import type { WeaponPiece } from "@stores/weapons";
import { $allOwnedWeapons, $customWeaponList } from "@stores/weapons";

import { Chevron } from "../shared/Chevron";
import { HelpPopover } from "../shared/HelpPopover";
import { TabStrip } from "../shared/TabStrip";

import { WeaponHelpContent } from "./help/WeaponHelpContent";
import { WeaponCard } from "./WeaponCard";

// Weapon type display order
const TYPE_ORDER: WeaponType[] = [
  "P",
  "SMG",
  "RIF",
  "SHT",
  "HVY",
  "EX",
  "melee",
];

type GroupItem = {
  id: string;
  weapon: WeaponTemplate | WeaponPiece;
  custom?: boolean;
};

function groupByType(items: GroupItem[]): [string, GroupItem[]][] {
  const grouped = new Map<string, GroupItem[]>();
  for (const item of items) {
    const type = item.weapon.type;
    if (!grouped.has(type)) grouped.set(type, []);
    grouped.get(type)!.push(item);
  }
  return TYPE_ORDER.filter((t) => grouped.has(t)).map((t) => [
    WEAPON_TYPE_LABELS[t],
    grouped.get(t)!,
  ]);
}

function WeaponGroup({
  label,
  count,
  collapsed,
  onToggle,
  items,
  selectedId,
}: {
  label: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  items: GroupItem[];
  selectedId: string | null;
}) {
  return (
    <div class="gear-group">
      <div class="gear-group-label" onClick={onToggle}>
        <span>
          {label}
          {count > 0 && <span class="gear-group-count">{count}</span>}
        </span>
        <Chevron expanded={!collapsed} />
      </div>
      {collapsed ? (
        <>
          <WeaponCard
            weapon={items[0].weapon}
            custom={items[0].custom}
            selected={selectedId === items[0].id}
            onClick={() =>
              selectWeapon(selectedId === items[0].id ? null : items[0].id)
            }
          />
          {items.length > 1 && (
            <div class="gear-group-more" onClick={onToggle}>
              +{items.length - 1} more
            </div>
          )}
        </>
      ) : (
        items.map((item) => (
          <WeaponCard
            key={item.id}
            weapon={item.weapon}
            custom={item.custom}
            selected={selectedId === item.id}
            onClick={() =>
              selectWeapon(selectedId === item.id ? null : item.id)
            }
          />
        ))
      )}
    </div>
  );
}

const catalogItems = Object.values(WEAPON_CATALOG);

export const WeaponListPanel = () => {
  const ownedWeapons = useStore($allOwnedWeapons);
  const customTemplates = useStore($customWeaponList);
  const selectedId = useStore($selectedWeapon);
  const tab = useStore(tabStore("weapon-list-tab", "catalog"));
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleGroup = (type: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  // Catalog view
  const catalogGroups = groupByType(
    catalogItems.map((t) => ({
      id: t.templateId,
      weapon: t,
    })),
  );

  // Owned view
  const ownedGroups = groupByType(
    ownedWeapons.map((w) => ({
      id: w.id,
      weapon: w,
      custom: w.custom,
    })),
  );

  // Custom view
  const customGroups = groupByType(
    customTemplates.map((t) => ({
      id: t.templateId,
      weapon: t,
      custom: true,
    })),
  );

  return (
    <div class="panel" id="weapon-panel">
      <div class="panel-heading">
        <h2 class="title text-sm">
          Weapons{" "}
          <HelpPopover id="weapon-help" content={<WeaponHelpContent />} />
        </h2>
        <TabStrip
          persist="weapon-list-tab"
          tabs={[
            { id: "catalog", label: "Catalog" },
            {
              id: "custom",
              label: `Custom${customTemplates.length > 0 ? ` ${customTemplates.length}` : ""}`,
            },
            {
              id: "owned",
              label: `Owned${ownedWeapons.length > 0 ? ` ${ownedWeapons.length}` : ""}`,
            },
          ]}
        />
      </div>

      {tab === "custom" && (
        <div class="gear-toolbar">
          <button
            class="btn-sm gear-add-btn"
            onClick={() => startAddingWeapon()}
          >
            + Add Custom
          </button>
        </div>
      )}

      <div class="gear-grid">
        {tab === "catalog" &&
          catalogGroups.map(([type, items]) => (
            <WeaponGroup
              key={type}
              label={type}
              count={items.length}
              collapsed={collapsed.has(type)}
              onToggle={() => toggleGroup(type)}
              items={items}
              selectedId={selectedId}
            />
          ))}
        {tab === "custom" &&
          (customGroups.length > 0 ? (
            customGroups.map(([type, items]) => (
              <WeaponGroup
                key={type}
                label={type}
                count={items.length}
                collapsed={collapsed.has(type)}
                onToggle={() => toggleGroup(type)}
                items={items}
                selectedId={selectedId}
              />
            ))
          ) : (
            <div class="empty-message">No custom weapons yet</div>
          ))}
        {tab === "owned" &&
          (ownedGroups.length > 0 ? (
            ownedGroups.map(([type, items]) => (
              <WeaponGroup
                key={type}
                label={type}
                count={items.length}
                collapsed={collapsed.has(type)}
                onToggle={() => toggleGroup(type)}
                items={items}
                selectedId={selectedId}
              />
            ))
          ) : (
            <div class="empty-message">No weapons yet</div>
          ))}
      </div>
    </div>
  );
};
