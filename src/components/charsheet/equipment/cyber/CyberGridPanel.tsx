import { CATEGORY_LABELS, type CyberCategory } from "@scripts/cyber/catalog";

import { getConditionClassFromSP } from "../utils";

import type { CyberItem, CyberlimbCell } from "./cyberViewTypes";

// --- CategoryCard ---

function CategoryCard({
  category,
  items,
  selectedId,
  onItemClick,
  onHeaderClick,
}: {
  category: CyberCategory;
  items: CyberItem[];
  selectedId: string | null;
  onItemClick: (item: CyberItem) => void;
  onHeaderClick: () => void;
}) {
  // Group: containers with nested children, plus top-level items
  const containers = items.filter((i) => i.role === "container");
  const childrenByParent = new Map<string, CyberItem[]>();
  for (const item of items) {
    if (item.parentId) {
      const arr = childrenByParent.get(item.parentId) ?? [];
      arr.push(item);
      childrenByParent.set(item.parentId, arr);
    }
  }
  const topLevel = items.filter(
    (i) => i.role !== "container" && !i.parentId,
  );

  const renderLayer = (item: CyberItem) => (
    <div
      key={item.id}
      class={`layer layer-clickable${selectedId === item.id ? " layer-active" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onItemClick(item);
      }}
    >
      <span class="layer-name">
        <span class="layer-label">{item.name}</span>
      </span>
    </div>
  );

  return (
    <div class="body-part body-part-clickable">
      <div class="body-part-header" onClick={onHeaderClick}>
        <h3>{CATEGORY_LABELS[category]}</h3>
      </div>
      <div class="layer-list">
        {containers.map((container) => {
          const children = childrenByParent.get(container.id) ?? [];
          return (
            <div key={container.id}>
              {renderLayer(container)}
              {children.length > 0 && (
                <div class="layer-children">
                  {children.map(renderLayer)}
                </div>
              )}
            </div>
          );
        })}
        {topLevel.map(renderLayer)}
      </div>
    </div>
  );
}

// --- CyberlimbsCard ---

function CyberlimbsCard({
  limbs,
  selectedId,
  onLimbClick,
}: {
  limbs: CyberlimbCell[];
  selectedId: string | null;
  onLimbClick: (limbId: string) => void;
}) {
  return (
    <div class="cyber-limbs-grid">
      {limbs.map((limb) => {
        const limbId = `limb-${limb.slot}`;
        const conditionClass =
          limb.isCyber && limb.sdpCurrent != null && limb.sdpMax != null
            ? getConditionClassFromSP(limb.sdpCurrent, limb.sdpMax)
            : "";
        return (
          <div
            key={limb.slot}
            class={`cyber-limb-cell${limb.isCyber ? "" : " cyber-limb-meat"}${
              selectedId === limbId ? " cyber-limb-selected" : ""
            }${conditionClass ? ` ${conditionClass}` : ""}`}
            onClick={() => onLimbClick(limbId)}
          >
            <span class="cyber-limb-label">{limb.label}</span>
            {limb.isCyber ? (
              <span class="cyber-limb-sdp">
                {limb.sdpCurrent}/{limb.sdpMax}
              </span>
            ) : (
              <span class="cyber-limb-meat-label">meat</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- CyberGridPanel ---

interface CyberGridPanelProps {
  categories: { category: CyberCategory; items: CyberItem[] }[];
  limbs: CyberlimbCell[];
  selectedId: string | null;
  onItemClick: (item: CyberItem) => void;
  onLimbClick: (limbId: string) => void;
  onCategoryClick: (cat: CyberCategory) => void;
}

export function CyberGridPanel({
  categories,
  limbs,
  selectedId,
  onItemClick,
  onLimbClick,
  onCategoryClick,
}: CyberGridPanelProps) {
  const leftCol = categories.filter((_, i) => i % 2 === 0);
  const rightCol = categories.filter((_, i) => i % 2 === 1);

  const renderCard = ({
    category,
    items,
  }: {
    category: CyberCategory;
    items: CyberItem[];
  }) =>
    category === "cyberlimbs" ? (
      <div key="cyberlimbs" class="body-part">
        <CyberlimbsCard
          limbs={limbs}
          selectedId={selectedId}
          onLimbClick={onLimbClick}
        />
      </div>
    ) : (
      <CategoryCard
        key={category}
        category={category}
        items={items}
        selectedId={selectedId}
        onItemClick={onItemClick}
        onHeaderClick={() => onCategoryClick(category)}
      />
    );

  return (
    <div class="cyber-category-grid">
      <div class="cyber-column">{leftCol.map(renderCard)}</div>
      <div class="cyber-column">{rightCol.map(renderCard)}</div>
    </div>
  );
}

export function HcRow({
  hcData,
}: {
  hcData: {
    humanity: number;
    hcTotal: number;
    empBase: number;
    empCurrent: number;
  };
}) {
  return (
    <span class="cyber-hc-row">
      Hum: <strong>{hcData.humanity}</strong>
      <span class="cyber-hc-sep">{"\u00B7"}</span>
      HC: <strong>{hcData.hcTotal}</strong>
      <span class="cyber-hc-sep">{"\u00B7"}</span>
      EMP: {hcData.empBase} {"\u2192"} <strong>{hcData.empCurrent}</strong>
    </span>
  );
}
