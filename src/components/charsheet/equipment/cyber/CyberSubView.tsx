import { useStore } from "@nanostores/preact";
import { useMemo, useState } from "preact/hooks";

import { Panel } from "@components/charsheet/shared/Panel";
import { TwoPanelView } from "@components/charsheet/shared/TwoPanelView";
import {
  CATEGORY_ORDER,
  CYBER_CATALOG,
  type CyberCategory,
} from "@scripts/cyber/catalog";
import {
  $hcData,
  $hydratedCyber,
  $installedByCategory,
  getSlotUsage,
} from "@stores/cyber";
import { $selectedCyber, selectCyber } from "@stores/ui";

import { CyberGridPanel, HcRow } from "./CyberGridPanel";
import { CyberListPanel } from "./CyberListPanel";
import type { CyberItem, CyberlimbCell } from "./cyberViewTypes";
import { DEFAULT_LIMBS, hydratedToCyberItem } from "./cyberViewTypes";

const EMPTY_LIMB_OPTIONS: Record<CyberlimbCell["slot"], never[]> = {
  la: [],
  ra: [],
  ll: [],
  rl: [],
};

export default function CyberSubView() {
  const selectedId = useStore($selectedCyber);
  const hydrated = useStore($hydratedCyber);
  const installedByCategory = useStore($installedByCategory);
  const hcData = useStore($hcData);
  const [activeCategory, setActiveCategory] =
    useState<CyberCategory>("fashionware");
  const [activeSlot, setActiveSlot] = useState<CyberlimbCell["slot"]>("ra");

  // Build catalog view: mark which templates are owned/installed
  const ownedTemplateIds = useMemo(
    () => new Set(hydrated.map((i) => i.templateId)),
    [hydrated],
  );
  const installedTemplateIds = useMemo(
    () => new Set(hydrated.filter((i) => i.installed).map((i) => i.templateId)),
    [hydrated],
  );

  const catalog = useMemo(() => {
    const result = {} as Record<CyberCategory, CyberItem[]>;
    for (const cat of CATEGORY_ORDER) {
      result[cat] = [];
    }
    for (const t of Object.values(CYBER_CATALOG)) {
      const item: CyberItem = {
        ...t,
        owned: ownedTemplateIds.has(t.id),
        installed: installedTemplateIds.has(t.id),
        isBase: t.role === "container",
      };
      result[t.category].push(item);
    }
    return result;
  }, [ownedTemplateIds, installedTemplateIds]);

  // All owned items for the "Owned" tab — with slotUsage and auto-numbering
  const owned = useMemo(() => {
    // Count containers per template for "#1", "#2" labels
    const containerCounts: Record<string, number> = {};
    for (const h of hydrated) {
      if (h.template.role === "container") {
        containerCounts[h.templateId] =
          (containerCounts[h.templateId] ?? 0) + 1;
      }
    }
    const containerIndex: Record<string, number> = {};

    return hydrated
      .map((h) => {
        const item = hydratedToCyberItem(h);
        if (h.template.role === "container") {
          item.slotUsage = getSlotUsage(h.instanceId);
          if (containerCounts[h.templateId] > 1) {
            containerIndex[h.templateId] =
              (containerIndex[h.templateId] ?? 0) + 1;
            item.name = `${h.template.name} #${containerIndex[h.templateId]}`;
          }
        }
        return item;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [hydrated]);

  const gridCategories = useMemo(
    () =>
      installedByCategory.map(({ category, items }) => ({
        category,
        items: items.map(hydratedToCyberItem),
      })),
    [installedByCategory],
  );

  const handleItemClick = (item: { id: string; category: CyberCategory }) => {
    selectCyber(selectedId === item.id ? null : item.id);
    setActiveCategory(item.category);
  };

  const handleLimbClick = (limbId: string) => {
    selectCyber(selectedId === limbId ? null : limbId);
    setActiveCategory("cyberlimbs");
    const slot = limbId.replace("limb-", "") as CyberlimbCell["slot"];
    setActiveSlot(slot);
  };

  const handleCategoryChange = (cat: CyberCategory) => {
    setActiveCategory(cat);
    if (cat === "cyberlimbs") {
      const firstCyber = DEFAULT_LIMBS.find((l) => l.isCyber);
      if (firstCyber) setActiveSlot(firstCyber.slot);
    }
  };

  return (
    <TwoPanelView
      renderFirst={(expanded, onToggle) => (
        <CyberListPanel
          title={<HcRow hcData={hcData} />}
          expanded={expanded}
          onToggle={onToggle}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          activeSlot={activeSlot}
          onSlotChange={setActiveSlot}
          limbs={DEFAULT_LIMBS}
          limbOptions={EMPTY_LIMB_OPTIONS}
          catalog={catalog}
          owned={owned}
          selectedId={selectedId}
          onSelect={(id) => selectCyber(selectedId === id ? null : id)}
        />
      )}
      renderSecond={(expanded, onToggle) => (
        <Panel
          id="cyber-grid-panel"
          title="Installed"
          expanded={expanded}
          onToggle={onToggle}
        >
          <CyberGridPanel
            categories={gridCategories}
            limbs={DEFAULT_LIMBS}
            selectedId={selectedId}
            onItemClick={handleItemClick}
            onLimbClick={handleLimbClick}
            onCategoryClick={handleCategoryChange}
          />
        </Panel>
      )}
    />
  );
}
