import { useStore } from "@nanostores/preact";

import { tabStore } from "@stores/ui";

import { ItemMeta } from "../shared/ItemMeta";
import { Panel } from "../shared/Panel";
import { TabStrip } from "../shared/TabStrip";
import { useScrollOnSelect } from "../shared/useScrollOnSelect";

import type { CyberCategory, CyberItem, CyberlimbCell } from "./cyberMockData";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  MOCK_CYBER_REPLACEMENTS,
  MOCK_LIMB_OPTION_CATALOG,
  MOCK_LIMB_OPTIONS,
  MOCK_MEAT_REPLACEMENTS,
} from "./cyberMockData";

// --- Shared card rendering ---

function CyberItemCard({
  item,
  selected,
  accent,
  catalog,
  onSelect,
}: {
  item: CyberItem;
  selected: boolean;
  accent: boolean;
  catalog: boolean;
  onSelect: () => void;
}) {
  const ref = useScrollOnSelect<HTMLDivElement>(selected);
  return (
    <div
      ref={ref}
      class={`item-card${accent ? " item-card-accent" : ""}${selected ? " selected" : ""}`}
      onClick={onSelect}
    >
      <div class="flex-between gap-8">
        <h4>{item.name}</h4>
        {catalog && item.availability ? (
          <ItemMeta availability={item.availability} cost={item.cost} />
        ) : (
          <span class="item-meta">
            <span class="text-soft">HC {item.hc}</span>
          </span>
        )}
      </div>
      <p class="text-desc">{item.description}</p>
    </div>
  );
}

// --- Item list with base/option separator ---

function ItemListWithSep({
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
  const hasBase = items.some((i) => i.isBase);
  const baseItems = hasBase ? items.filter((i) => i.isBase) : [];
  const optionItems = hasBase ? items.filter((i) => !i.isBase) : items;

  return (
    <>
      {baseItems.map((item) => (
        <CyberItemCard
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          accent={item.installed}
          catalog={catalog}
          onSelect={() => onSelect(item.id)}
        />
      ))}
      {hasBase && optionItems.length > 0 && <hr class="cyber-base-sep" />}
      {optionItems.map((item) => (
        <CyberItemCard
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          accent={item.installed}
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

function buildLimbItems(
  limb: CyberlimbCell,
  slot: CyberlimbCell["slot"],
  catalog: boolean,
): CyberItem[] {
  const limbType = getLimbType(slot);
  const installedOptions = MOCK_LIMB_OPTIONS[slot];
  const installedNames = new Set(installedOptions.map((o) => o.name));

  const currentBase: CyberItem = {
    id: `limb-${slot}`,
    name: limb.name,
    category: "cyberlimbs",
    description: limb.isCyber
      ? `SDP ${limb.sdpCurrent}/${limb.sdpMax}`
      : "Natural limb",
    hc: limb.hc ?? 0,
    installed: true,
    isBase: true,
    availability: limb.availability,
    cost: limb.cost,
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
  expanded: boolean;
  onToggle: () => void;
  activeCategory: CyberCategory;
  onCategoryChange: (cat: CyberCategory) => void;
  activeSlot: CyberlimbCell["slot"];
  onSlotChange: (slot: CyberlimbCell["slot"]) => void;
  limbs: CyberlimbCell[];
  catalog: Record<CyberCategory, CyberItem[]>;
  installed: CyberItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CyberListPanel({
  expanded,
  onToggle,
  activeCategory,
  onCategoryChange,
  activeSlot,
  onSlotChange,
  limbs,
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
      ? buildLimbItems(activeLimb, activeSlot, isCatalog)
      : isCatalog
        ? (catalog[activeCategory] ?? [])
        : installed.filter((i) => i.category === activeCategory);

  const ownedCount = isLimbs
    ? limbs.filter((l) => l.isCyber).length +
      Object.values(MOCK_LIMB_OPTIONS).flat().length
    : installed.filter((i) => i.category === activeCategory).length;

  return (
    <Panel
      id="cyber-list-panel"
      title="Subsystems"
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
      <div class="caliber-badge-bar">
        {badgeCategories.map((cat) => (
          <button
            key={cat}
            class={`caliber-badge${activeCategory === cat ? " active" : ""}`}
            onClick={() => onCategoryChange(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {isLimbs && (
        <div class="caliber-badge-bar">
          {limbs.map((limb) => (
            <button
              key={limb.slot}
              class={`caliber-badge${activeSlot === limb.slot ? " active" : ""}`}
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
          <ItemListWithSep
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
