import { useStore } from "@nanostores/preact";

import { CollapsibleGroup } from "@components/charsheet/shared/CollapsibleGroup";
import { groupBy } from "@components/charsheet/shared/groupBy";
import { TabStrip } from "@components/charsheet/shared/TabStrip";
import { useCollapsibleGroups } from "@components/charsheet/shared/useCollapsibleGroups";
import type { GearTemplate } from "@scripts/gear/catalog";
import { GEAR_CATALOG } from "@scripts/gear/catalog";
import { $customGear, $gear, $ownedGear, $ownedGearCount } from "@stores/gear";
import { $selectedGear, startAddingGear, tabStore } from "@stores/ui";

import { GearCard } from "./GearCard";

function GearGroup({
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
  items: {
    id: string;
    template: GearTemplate;
    quantity: number;
    custom?: boolean;
  }[];
  selectedId: string | null;
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
        <GearCard
          id={items[0].id}
          template={items[0].template}
          quantity={items[0].quantity}
          custom={items[0].custom}
          selected={selectedId === items[0].id}
        />
      ) : (
        items.map((item) => (
          <GearCard
            key={item.id}
            id={item.id}
            template={item.template}
            quantity={item.quantity}
            custom={item.custom}
            selected={selectedId === item.id}
          />
        ))
      )}
    </CollapsibleGroup>
  );
}

/** Group items by type, sorted alphabetically. */
function groupByType(
  items: {
    id: string;
    template: GearTemplate;
    quantity: number;
    custom?: boolean;
  }[],
) {
  return groupBy(items, (i) => i.template.type);
}

const catalogItems = Object.values(GEAR_CATALOG);

export default function GearPanel() {
  const gearState = useStore($gear);
  const ownedCount = useStore($ownedGearCount);
  const customGear = useStore($customGear);
  const selectedId = useStore($selectedGear);
  const tab = useStore(tabStore("gear-tab", "catalog"));
  const { collapsed, toggle: toggleGroup } = useCollapsibleGroups();

  // Catalog view: all templates grouped by type
  const catalogGroups = groupByType(
    catalogItems.map((template) => ({
      id: template.templateId,
      template,
      quantity: gearState[template.templateId] ?? 0,
    })),
  );

  // Owned view: all owned items (catalog + custom) grouped by type
  const ownedItems = useStore($ownedGear);
  const ownedGroups = groupByType(
    ownedItems.map((item) => ({
      id: item.templateId,
      template: item,
      quantity: item.quantity,
      custom: item.custom,
    })),
  );

  // Custom view: only custom items
  const customItems = customGear.map((item) => ({
    id: item.templateId,
    template: item as GearTemplate,
    quantity: item.quantity,
    custom: true,
  }));
  const customGroups = groupByType(customItems);

  return (
    <div class="panel" id="gear-panel">
      <div class="panel-heading">
        <h2 class="title text-sm">Gear</h2>
        <TabStrip
          persist="gear-tab"
          tabs={[
            { id: "catalog", label: "Catalog" },
            {
              id: "custom",
              label: `Custom${customGear.length > 0 ? ` ${customGear.length}` : ""}`,
            },
            {
              id: "owned",
              label: `Owned${ownedCount > 0 ? ` ${ownedCount}` : ""}`,
            },
          ]}
        />
      </div>

      {tab === "custom" && (
        <div class="gear-toolbar">
          <button class="btn-sm gear-add-btn" onClick={() => startAddingGear()}>
            + Add Custom
          </button>
        </div>
      )}

      <div class="gear-grid">
        {tab === "catalog" &&
          catalogGroups.map(([type, items]) => (
            <GearGroup
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
              <GearGroup
                key={type}
                label={type}
                count={items.reduce((s, i) => s + i.quantity, 0)}
                collapsed={collapsed.has(type)}
                onToggle={() => toggleGroup(type)}
                items={items}
                selectedId={selectedId}
              />
            ))
          ) : (
            <div class="empty-message">No custom gear yet</div>
          ))}
        {tab === "owned" &&
          (ownedGroups.length > 0 ? (
            ownedGroups.map(([type, items]) => (
              <GearGroup
                key={type}
                label={type}
                count={items.reduce((s, i) => s + i.quantity, 0)}
                collapsed={collapsed.has(type)}
                onToggle={() => toggleGroup(type)}
                items={items}
                selectedId={selectedId}
              />
            ))
          ) : (
            <div class="empty-message">
              No gear yet. Browse the Catalog to add some.
            </div>
          ))}
      </div>
    </div>
  );
}
