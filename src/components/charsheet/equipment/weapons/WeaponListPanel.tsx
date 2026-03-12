import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";

import { AMMO_CATALOG } from "@scripts/ammo/catalog";
import type { WeaponTemplate, WeaponType } from "@scripts/weapons/catalog";
import { WEAPON_CATALOG, WEAPON_TYPE_LABELS } from "@scripts/weapons/catalog";
import { $customAmmoItems } from "@stores/ammo";
import {
  $selectedAmmo,
  $selectedWeapon,
  selectWeapon,
  startAddingWeapon,
  tabStore,
} from "@stores/ui";
import type { WeaponPiece } from "@stores/weapons";
import { $allOwnedWeapons, $customWeaponList } from "@stores/weapons";

import { CollapsibleGroup } from "../../shared/CollapsibleGroup";
import { HelpPopover } from "../../shared/HelpPopover";
import { Panel } from "../../shared/Panel";
import { TabStrip } from "../../shared/TabStrip";

import { WeaponCard } from "./WeaponCard";
import { WeaponHelpContent } from "./WeaponHelpContent";

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
  owned?: boolean;
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
  highlightedCaliber,
}: {
  label: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  items: GroupItem[];
  selectedId: string | null;
  highlightedCaliber: string | null;
}) {
  return (
    <CollapsibleGroup
      label={label}
      count={count || undefined}
      collapsed={collapsed}
      onToggle={onToggle}
      restCount={items.length - 1}
    >
      {collapsed ? (
        <WeaponCard
          weapon={items[0].weapon}
          owned={items[0].owned}
          custom={items[0].custom}
          selected={selectedId === items[0].id}
          highlighted={highlightedCaliber === items[0].weapon.ammo}
          onClick={() =>
            selectWeapon(selectedId === items[0].id ? null : items[0].id)
          }
        />
      ) : (
        items.map((item) => (
          <WeaponCard
            key={item.id}
            weapon={item.weapon}
            owned={item.owned}
            custom={item.custom}
            selected={selectedId === item.id}
            highlighted={highlightedCaliber === item.weapon.ammo}
            onClick={() =>
              selectWeapon(selectedId === item.id ? null : item.id)
            }
          />
        ))
      )}
    </CollapsibleGroup>
  );
}

const catalogItems = Object.values(WEAPON_CATALOG);

export const WeaponListPanel = ({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) => {
  const ownedWeapons = useStore($allOwnedWeapons);
  const customTemplates = useStore($customWeaponList);
  const selectedId = useStore($selectedWeapon);
  const tab = useStore(tabStore("weapon-list-tab", "catalog"));
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Cross-highlighting: derive caliber from selected ammo
  const selectedAmmoId = useStore($selectedAmmo);
  const customAmmoDefs = useStore($customAmmoItems);
  const highlightedCaliber =
    selectedAmmoId != null
      ? (AMMO_CATALOG[selectedAmmoId]?.caliber ??
        customAmmoDefs[selectedAmmoId]?.caliber ??
        null)
      : null;

  const toggleGroup = (type: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  // Ownership lookup for catalog/custom tabs
  const ownedTemplateIds = new Set(ownedWeapons.map((w) => w.templateId));

  // Catalog view
  const catalogGroups = groupByType(
    catalogItems.map((t) => ({
      id: t.templateId,
      weapon: t,
      owned: ownedTemplateIds.has(t.templateId),
    })),
  );

  // Owned view
  const ownedGroups = groupByType(
    ownedWeapons.map((w) => ({
      id: w.id,
      weapon: w,
      owned: true,
      custom: w.custom,
    })),
  );

  // Custom view
  const customGroups = groupByType(
    customTemplates.map((t) => ({
      id: t.templateId,
      weapon: t,
      owned: ownedTemplateIds.has(t.templateId),
      custom: true,
    })),
  );

  return (
    <Panel
      id="weapon-panel"
      title={
        <>
          Weapons{" "}
          <HelpPopover id="weapon-help" content={<WeaponHelpContent />} />
        </>
      }
      expanded={expanded}
      onToggle={onToggle}
      headerActions={
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
      }
    >
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
              highlightedCaliber={highlightedCaliber}
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
                highlightedCaliber={highlightedCaliber}
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
                highlightedCaliber={highlightedCaliber}
              />
            ))
          ) : (
            <div class="empty-message">No weapons yet. Browse the Catalog to add some.</div>
          ))}
      </div>
    </Panel>
  );
};
