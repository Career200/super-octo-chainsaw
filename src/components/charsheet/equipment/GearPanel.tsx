import { useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { GEAR_CATALOG } from "@scripts/gear/catalog";
import type { GearTemplate } from "@scripts/gear/catalog";
import {
  $gear,
  addGear,
  removeGear,
  $ownedGear,
  $ownedGearCount,
  $customGear,
} from "@stores/gear";
import { $selectedGear, selectGear, startAddingGear, tabStore } from "@stores/ui";
import { Chevron } from "../shared/Chevron";
import { ItemMeta } from "../shared/ItemMeta";
import { TabStrip } from "../shared/TabStrip";

function GearCard({
  id,
  template,
  quantity,
  custom,
  selected,
}: {
  id: string;
  template: GearTemplate;
  quantity: number;
  custom?: boolean;
  selected?: boolean;
}) {
  return (
    <div
      class={`item-card gear-card${selected ? " selected" : ""}${custom ? " item-card-accent" : ""}`}
      onClick={() => selectGear(selected ? null : id)}
    >
      <div class="flex-between gap-8">
        <h4>{template.name}</h4>
        <ItemMeta availability={template.availability} cost={template.cost} />
      </div>
      <div class="gear-actions">
        {quantity > 0 ? (
          <div class="gear-qty-controls">
            <button
              class="btn-sm gear-qty-btn"
              onClick={(e) => {
                e.stopPropagation();
                removeGear(id);
              }}
            >
              −
            </button>
            <span class="gear-qty-value">{quantity}</span>
            <button
              class="btn-sm gear-qty-btn"
              onClick={(e) => {
                e.stopPropagation();
                addGear(id);
              }}
            >
              +
            </button>
          </div>
        ) : (
          <button
            class="btn-sm gear-take-btn"
            onClick={(e) => {
              e.stopPropagation();
              addGear(id);
            }}
          >
            Take
          </button>
        )}
      </div>
    </div>
  );
}

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
  items: { id: string; template: GearTemplate; quantity: number; custom?: boolean }[];
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
          <GearCard
            id={items[0].id}
            template={items[0].template}
            quantity={items[0].quantity}
            custom={items[0].custom}
            selected={selectedId === items[0].id}
          />
          {items.length > 1 && (
            <div class="gear-group-more" onClick={onToggle}>
              +{items.length - 1} more
            </div>
          )}
        </>
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
    </div>
  );
}

/** Group items by type. Returns groups in insertion order, types sorted alphabetically. */
function groupByType(
  items: { id: string; template: GearTemplate; quantity: number; custom?: boolean }[],
) {
  const grouped = new Map<
    string,
    { id: string; template: GearTemplate; quantity: number; custom?: boolean }[]
  >();
  for (const item of items) {
    const type = item.template.type;
    if (!grouped.has(type)) grouped.set(type, []);
    grouped.get(type)!.push(item);
  }
  // Sort groups alphabetically by type
  return [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

const catalogItems = Object.values(GEAR_CATALOG);

export const GearPanel = () => {
  const gearState = useStore($gear);
  const ownedCount = useStore($ownedGearCount);
  const customGear = useStore($customGear);
  const selectedId = useStore($selectedGear);
  const tab = useStore(tabStore("gear-tab", "catalog"));
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleGroup = (type: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

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
          <button
            class="btn-sm gear-add-btn"
            onClick={() => startAddingGear()}
          >
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
            <div class="empty-message">No gear yet</div>
          ))}
      </div>
    </div>
  );
};
