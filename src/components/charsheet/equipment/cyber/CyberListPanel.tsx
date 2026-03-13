import { useStore } from "@nanostores/preact";
import type { ComponentChildren } from "preact";
import { useState } from "preact/hooks";

import { CollapsibleGroup } from "@components/charsheet/shared/CollapsibleGroup";
import { ItemCard } from "@components/charsheet/shared/ItemCard";
import { ItemMeta } from "@components/charsheet/shared/ItemMeta";
import { Panel } from "@components/charsheet/shared/Panel";
import { TabStrip } from "@components/charsheet/shared/TabStrip";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type CyberCategory,
} from "@scripts/cyber/catalog";
import { tabStore } from "@stores/ui";

import type { CyberItem, CyberlimbCell, LimbOption } from "./cyberViewTypes";

// --- Shared card rendering ---

function CyberItemCard({
  item,
  selected,
  owned,
  equipped,
  catalog,
  onSelect,
  badge,
}: {
  item: CyberItem;
  selected: boolean;
  owned: boolean;
  equipped: boolean;
  catalog: boolean;
  onSelect: () => void;
  badge?: string;
}) {
  const opts = item.installedOptions;
  return (
    <ItemCard
      selected={selected}
      owned={owned}
      equipped={equipped}
      onClick={onSelect}
      name={
        badge ? (
          <>
            {item.name}
            <span class="cyber-slot-badge">{badge}</span>
          </>
        ) : (
          item.name
        )
      }
      meta={
        catalog && item.availability ? (
          <ItemMeta availability={item.availability} cost={item.cost} />
        ) : (
          <span class="item-meta">
            <span class="text-soft">HC {item.hc}</span>
          </span>
        )
      }
    >
      <p class="text-desc">{item.description}</p>
      {opts && opts.length > 0 && (
        <div class="layer-list">
          {opts.map((name) => (
            <div class="layer" key={name}>
              <span class="layer-name">
                <span class="layer-label">{name}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </ItemCard>
  );
}

// --- Collapsible base group ---

function BaseGroup({
  items,
  selectedId,
  catalog,
  onSelect,
}: {
  items: CyberItem[];
  selectedId: string | null;
  catalog: boolean;
  onSelect: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const sorted = [...items].sort((a, b) =>
    a.installed === b.installed ? 0 : a.installed ? -1 : 1,
  );
  const first = sorted[0];
  const rest = sorted.slice(1);

  return (
    <CollapsibleGroup
      label="Base"
      count={items.length}
      collapsed={collapsed}
      onToggle={rest.length > 0 ? () => setCollapsed(!collapsed) : undefined}
      class="cyber-base-group"
      restCount={rest.length}
    >
      {first && (
        <CyberItemCard
          item={first}
          selected={selectedId === first.id}
          owned={first.owned}
          equipped={first.installed}
          catalog={catalog}
          onSelect={() => onSelect(first.id)}
        />
      )}
      {!collapsed &&
        rest.map((item) => (
          <CyberItemCard
            key={item.id}
            item={item}
            selected={selectedId === item.id}
            owned={item.owned}
            equipped={item.installed}
            catalog={catalog}
            onSelect={() => onSelect(item.id)}
          />
        ))}
    </CollapsibleGroup>
  );
}

// --- Catalog list: base group + flat options ---

function CatalogItemList({
  items,
  selectedId,
  onSelect,
}: {
  items: CyberItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const baseItems = items.filter((i) => i.isBase);
  const optionItems = items.filter((i) => !i.isBase);

  // Enrich installed bases with their installed option names
  const installedOptionNames = optionItems
    .filter((i) => i.installed)
    .map((i) => i.name);
  const enrichedBases = baseItems.map((item) =>
    item.installed && installedOptionNames.length > 0
      ? { ...item, installedOptions: installedOptionNames }
      : item,
  );

  return (
    <>
      {enrichedBases.length > 0 && (
        <BaseGroup
          items={enrichedBases}
          selectedId={selectedId}
          catalog={true}
          onSelect={onSelect}
        />
      )}
      {optionItems.map((item) => (
        <CyberItemCard
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          owned={item.owned}
          equipped={item.installed}
          catalog={true}
          onSelect={() => onSelect(item.id)}
        />
      ))}
    </>
  );
}

// --- Owned list: grouped by container ---

function OwnedItemList({
  items,
  selectedId,
  onSelect,
}: {
  items: CyberItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const containers = items.filter((i) => i.role === "container");
  const slottedOptions = items.filter((i) => i.role === "option" && i.parentId);
  const unslottedOptions = items.filter(
    (i) => i.role === "option" && !i.parentId,
  );
  const standalone = items.filter(
    (i) => i.role === "standalone" || (!i.role && !i.isBase),
  );

  return (
    <>
      {containers.map((container) => {
        const children = slottedOptions.filter(
          (o) => o.parentId === container.id,
        );
        const { used, max } = container.slotUsage ?? { used: 0, max: null };
        const slotLabel = max != null ? `${used}/${max}` : `${used}`;
        return (
          <div key={container.id} class="cyber-container-group">
            <CyberItemCard
              item={container}
              selected={selectedId === container.id}
              owned={container.owned}
              equipped={container.installed}
              catalog={false}
              onSelect={() => onSelect(container.id)}
              badge={slotLabel}
            />
            {children.length > 0 && (
              <div class="cyber-container-children">
                {children.map((child) => (
                  <CyberItemCard
                    key={child.id}
                    item={child}
                    selected={selectedId === child.id}
                    owned={child.owned}
                    equipped={child.installed}
                    catalog={false}
                    onSelect={() => onSelect(child.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
      {unslottedOptions.map((item) => (
        <CyberItemCard
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          owned={item.owned}
          equipped={item.installed}
          catalog={false}
          onSelect={() => onSelect(item.id)}
        />
      ))}
      {standalone.map((item) => (
        <CyberItemCard
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          owned={item.owned}
          equipped={item.installed}
          catalog={false}
          onSelect={() => onSelect(item.id)}
        />
      ))}
    </>
  );
}

// --- Limb slot: assemble CyberItem[] from limb data ---

function buildLimbItems(
  limb: CyberlimbCell,
  slot: CyberlimbCell["slot"],
  installedLimbOptions: Record<CyberlimbCell["slot"], LimbOption[]>,
): CyberItem[] {
  const installedOptions = installedLimbOptions[slot];

  const currentBase: CyberItem = {
    id: `limb-${slot}`,
    name: limb.name,
    category: "cyberlimbs",
    description: limb.isCyber
      ? `SDP ${limb.sdpCurrent}/${limb.sdpMax}`
      : "Natural limb",
    hc: limb.hc ?? 0,
    owned: limb.isCyber,
    installed: limb.isCyber,
    isBase: true,
    availability: limb.availability,
    cost: limb.cost,
    installedOptions: limb.isCyber
      ? installedOptions.map((o) => o.name)
      : undefined,
  };

  // Limb options and replacement catalog will be added with cyberlimb templates
  return [currentBase];
}

interface CyberListPanelProps {
  title: ComponentChildren;
  expanded: boolean;
  onToggle: () => void;
  activeCategory: CyberCategory;
  onCategoryChange: (cat: CyberCategory) => void;
  activeSlot: CyberlimbCell["slot"];
  onSlotChange: (slot: CyberlimbCell["slot"]) => void;
  limbs: CyberlimbCell[];
  limbOptions: Record<CyberlimbCell["slot"], LimbOption[]>;
  catalog: Record<CyberCategory, CyberItem[]>;
  owned: CyberItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CyberListPanel({
  title,
  expanded,
  onToggle,
  activeCategory,
  onCategoryChange,
  activeSlot,
  onSlotChange,
  limbs,
  limbOptions,
  catalog,
  owned,
  selectedId,
  onSelect,
}: CyberListPanelProps) {
  const tab = useStore(tabStore("cyber-list-tab", "catalog"));
  const isCatalog = tab === "catalog";

  // Always include cyberlimbs (always visible in left grid)
  const badgeCategories = CATEGORY_ORDER.filter(
    (cat) =>
      cat === "cyberlimbs" ||
      (catalog[cat]?.length ?? 0) > 0 ||
      owned.some((i) => i.category === cat),
  );

  const isLimbs = activeCategory === "cyberlimbs";
  const activeLimb = isLimbs ? limbs.find((l) => l.slot === activeSlot) : null;

  const currentItems =
    isLimbs && activeLimb
      ? buildLimbItems(activeLimb, activeSlot, limbOptions)
      : isCatalog
        ? (catalog[activeCategory] ?? [])
        : owned.filter((i) => i.category === activeCategory);

  const ownedCount = isLimbs
    ? limbs.filter((l) => l.isCyber).length +
      Object.values(limbOptions).flat().length
    : owned.filter((i) => i.category === activeCategory).length;

  return (
    <Panel
      id="cyber-list-panel"
      title={title}
      expanded={expanded}
      onToggle={onToggle}
      headerActions={
        <TabStrip
          persist="cyber-list-tab"
          tabs={[
            { id: "catalog", label: "Catalog" },
            {
              id: "owned",
              label: `Owned${ownedCount > 0 ? ` ${ownedCount}` : ""}`,
            },
          ]}
        />
      }
    >
      <div class="filter-badge-bar">
        {badgeCategories.map((cat) => (
          <button
            key={cat}
            class={`filter-badge${activeCategory === cat ? " active" : ""}`}
            onClick={() => onCategoryChange(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {isLimbs && (
        <div class="filter-badge-bar">
          {limbs.map((limb) => (
            <button
              key={limb.slot}
              class={`filter-badge${activeSlot === limb.slot ? " active" : ""}`}
              onClick={() => onSlotChange(limb.slot)}
            >
              {limb.label}
            </button>
          ))}
        </div>
      )}

      <div class="cyber-item-list">
        {currentItems.length === 0 ? (
          <div class="empty-message">
            {isCatalog ? "No items in catalog." : "Nothing owned."}
          </div>
        ) : isCatalog ? (
          <CatalogItemList
            items={currentItems}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ) : (
          <OwnedItemList
            items={currentItems}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        )}
      </div>
    </Panel>
  );
}
