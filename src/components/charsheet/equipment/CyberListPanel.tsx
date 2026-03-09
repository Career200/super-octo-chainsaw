import type { ComponentChildren } from "preact";
import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";

import { tabStore } from "@stores/ui";

import { CollapsibleGroup } from "../shared/CollapsibleGroup";
import { ItemCard } from "../shared/ItemCard";
import { ItemMeta } from "../shared/ItemMeta";
import { Panel } from "../shared/Panel";
import { TabStrip } from "../shared/TabStrip";

import type { CyberCategory, CyberItem, CyberlimbCell, LimbOption } from "./cyberMockData";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  MOCK_CYBER_REPLACEMENTS,
  MOCK_LIMB_OPTION_CATALOG,
  MOCK_MEAT_REPLACEMENTS,
} from "./cyberMockData";

// --- Shared card rendering ---

function CyberItemCard({
  item,
  selected,
  owned,
  equipped,
  catalog,
  onSelect,
}: {
  item: CyberItem;
  selected: boolean;
  owned: boolean;
  equipped: boolean;
  catalog: boolean;
  onSelect: () => void;
}) {
  const opts = item.installedOptions;
  return (
    <ItemCard
      selected={selected}
      owned={owned}
      equipped={equipped}
      onClick={onSelect}
      name={item.name}
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
  // Installed item first, then the rest
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
          owned={first.installed}
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
            owned={item.installed}
            equipped={item.installed}
            catalog={catalog}
            onSelect={() => onSelect(item.id)}
          />
        ))}
    </CollapsibleGroup>
  );
}

// --- Combined list: base group + flat options ---

function CyberItemList({
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
          catalog={catalog}
          onSelect={onSelect}
        />
      )}
      {optionItems.map((item) => (
        <CyberItemCard
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          owned={item.installed}
          equipped={item.installed}
          catalog={catalog}
          onSelect={() => onSelect(item.id)}
        />
      ))}
    </>
  );
}

// --- Limb slot: assemble CyberItem[] from limb data ---

function getLimbType(slot: CyberlimbCell["slot"]): "arm" | "leg" {
  return slot[1] === "a" ? "arm" : "leg";
}

const LIMB_OPTION_SLOTS = 3; // 4 total minus preinstalled hand/foot

function buildLimbItems(
  limb: CyberlimbCell,
  slot: CyberlimbCell["slot"],
  catalog: boolean,
  installedLimbOptions: Record<CyberlimbCell["slot"], LimbOption[]>,
): CyberItem[] {
  const limbType = getLimbType(slot);
  const installedOptions = installedLimbOptions[slot];
  const installedNames = new Set(installedOptions.map((o) => o.name));

  const currentBase: CyberItem = {
    id: `limb-${slot}`,
    name: limb.name,
    category: "cyberlimbs",
    description: limb.isCyber
      ? `SDP ${limb.sdpCurrent}/${limb.sdpMax} \u00B7 Options ${installedOptions.length}/${LIMB_OPTION_SLOTS}`
      : "Natural limb",
    hc: limb.hc ?? 0,
    installed: true,
    isBase: true,
    availability: limb.availability,
    cost: limb.cost,
    installedOptions: limb.isCyber
      ? installedOptions.map((o) => o.name)
      : undefined,
  };

  const altBase = limb.isCyber
    ? MOCK_MEAT_REPLACEMENTS[limbType]
    : MOCK_CYBER_REPLACEMENTS[limbType];

  const altBaseItem: CyberItem = {
    id: altBase.id,
    name: altBase.name,
    category: "cyberlimbs",
    description: altBase.description,
    hc: altBase.hc,
    installed: false,
    isBase: true,
    availability: altBase.availability,
    cost: altBase.cost,
  };

  const optionSource = limb.isCyber
    ? catalog
      ? MOCK_LIMB_OPTION_CATALOG
      : installedOptions
    : [];

  const options: CyberItem[] = optionSource.map((opt) => ({
    id: opt.id,
    name: opt.name,
    category: "cyberlimbs" as CyberCategory,
    description: opt.description,
    hc: opt.hc,
    installed: installedNames.has(opt.name),
    availability: opt.availability,
    cost: opt.cost,
  }));

  return [currentBase, ...(catalog ? [altBaseItem] : []), ...options];
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
  installed: CyberItem[];
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
  installed,
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
      installed.some((i) => i.category === cat),
  );

  const isLimbs = activeCategory === "cyberlimbs";
  const activeLimb = isLimbs ? limbs.find((l) => l.slot === activeSlot) : null;

  const currentItems =
    isLimbs && activeLimb
      ? buildLimbItems(activeLimb, activeSlot, isCatalog, limbOptions)
      : isCatalog
        ? (catalog[activeCategory] ?? [])
        : installed.filter((i) => i.category === activeCategory);

  const ownedCount = isLimbs
    ? limbs.filter((l) => l.isCyber).length +
      Object.values(limbOptions).flat().length
    : installed.filter((i) => i.category === activeCategory).length;

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
            {isCatalog ? "No items in catalog." : "Nothing installed."}
          </div>
        ) : (
          <CyberItemList
            items={currentItems}
            selectedId={selectedId}
            catalog={isCatalog}
            onSelect={onSelect}
          />
        )}
      </div>
    </Panel>
  );
}
