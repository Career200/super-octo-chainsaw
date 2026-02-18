import { useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  GEAR_CATALOG,
  GEAR_CATEGORIES,
  CATEGORY_LABELS,
  AVAILABILITY_LABELS,
} from "@scripts/gear/catalog";
import type { GearTemplate } from "@scripts/gear/catalog";
import { $gear, addGear, removeGear, $ownedGearCount } from "@stores/gear";
import { Panel } from "../shared/Panel";
import { Chevron } from "../shared/Chevron";

type GearTab = "catalog" | "owned";

function GearCard({
  template,
  quantity,
}: {
  template: GearTemplate;
  quantity: number;
}) {
  return (
    <div class="gear-card">
      <div class="flex-between gap-8">
        <h4>{template.name}</h4>
        <span class="gear-meta">
          {template.availability && (
            <span class="gear-avail">
              Av.{AVAILABILITY_LABELS[template.availability]}
            </span>
          )}
          {template.cost != null && (
            <span class="text-soft">
              <span class="cash">ᕮᕲ</span>
              {template.cost}eb
            </span>
          )}
        </span>
      </div>
      <p class="text-desc gear-description">{template.description}</p>
      <div class="gear-actions">
        {quantity > 0 ? (
          <div class="gear-qty-controls">
            <button
              class="btn-sm gear-qty-btn"
              onClick={() => removeGear(template.templateId)}
            >
              −
            </button>
            <span class="gear-qty-value">{quantity}</span>
            <button
              class="btn-sm gear-qty-btn"
              onClick={() => addGear(template.templateId)}
            >
              +
            </button>
          </div>
        ) : (
          <button
            class="btn-sm gear-take-btn"
            onClick={() => addGear(template.templateId)}
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
  gearState,
}: {
  label: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  items: { template: GearTemplate; quantity: number }[];
  gearState?: Record<string, number>;
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
            template={items[0].template}
            quantity={items[0].quantity}
          />
          {items.length > 1 && (
            <div class="gear-group-more" onClick={onToggle}>
              +{items.length - 1} more
            </div>
          )}
        </>
      ) : (
        items.map(({ template, quantity }) => (
          <GearCard
            key={template.templateId}
            template={template}
            quantity={quantity}
          />
        ))
      )}
    </div>
  );
}

const catalogByCategory = GEAR_CATEGORIES.map((cat) => ({
  category: cat,
  label: CATEGORY_LABELS[cat],
  items: Object.values(GEAR_CATALOG).filter((t) => t.category === cat),
})).filter((g) => g.items.length > 0);

export const GearPanel = () => {
  const gearState = useStore($gear);
  const ownedCount = useStore($ownedGearCount);
  const [tab, setTab] = useState<GearTab>("catalog");

  const ownedItems = Object.entries(gearState)
    .map(([id, qty]) => ({ template: GEAR_CATALOG[id], quantity: qty }))
    .filter((i) => i.template && i.quantity > 0);

  // Group owned items by category
  const ownedByCategory = GEAR_CATEGORIES.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: ownedItems.filter((i) => i.template.category === cat),
  })).filter((g) => g.items.length > 0);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(true);

  const toggleGroup = (cat: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <Panel
      id="gear-panel"
      title="Gear"
      expanded={expanded}
      onToggle={() => setExpanded((v) => !v)}
      headerActions={
        <span class="tab-strip" onClick={(e) => e.stopPropagation()}>
          <button
            class={tab === "catalog" ? "active" : ""}
            onClick={() => setTab("catalog")}
          >
            Catalog
          </button>
          <button
            class={tab === "owned" ? "active" : ""}
            onClick={() => setTab("owned")}
          >
            Owned{ownedCount > 0 && ` ${ownedCount}`}
          </button>
        </span>
      }
    >
      <div class="gear-grid">
        {tab === "catalog" &&
          catalogByCategory.map((group) => (
            <GearGroup
              key={group.category}
              label={group.label}
              count={group.items.length}
              collapsed={collapsed.has(group.category)}
              onToggle={() => toggleGroup(group.category)}
              items={group.items.map((template) => ({
                template,
                quantity: gearState[template.templateId] ?? 0,
              }))}
            />
          ))}
        {tab === "owned" &&
          (ownedByCategory.length > 0 ? (
            ownedByCategory.map((group) => (
              <GearGroup
                key={group.category}
                label={group.label}
                count={group.items.reduce((s, i) => s + i.quantity, 0)}
                collapsed={collapsed.has(group.category)}
                onToggle={() => toggleGroup(group.category)}
                items={group.items}
              />
            ))
          ) : (
            <div class="empty-message">No gear yet</div>
          ))}
      </div>
    </Panel>
  );
};
