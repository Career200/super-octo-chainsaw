import { useStore } from "@nanostores/preact";
import { useMemo, useState } from "preact/hooks";

import {
  CATEGORY_ORDER,
  CYBER_CATALOG,
  type CyberCategory,
} from "@scripts/cyber/catalog";
import { $hcData, $hydratedCyber, $installedByCategory } from "@stores/cyber";
import { $selectedCyber, selectCyber } from "@stores/ui";

import { Panel } from "../../shared/Panel";
import { TwoPanelView } from "../../shared/TwoPanelView";

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

  // Build catalog view: all templates grouped by category, marking installed ones
  const installedTemplateIds = useMemo(
    () => new Set(hydrated.map((i) => i.templateId)),
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
        installed: installedTemplateIds.has(t.id),
        isBase: t.role === "container",
      };
      result[t.category].push(item);
    }
    return result;
  }, [installedTemplateIds]);

  // Sort by templateId so duplicate instances group together.
  // TODO: revisit sort order when container→option parenting is wired up
  const installed = useMemo(
    () =>
      hydrated
        .map(hydratedToCyberItem)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [hydrated],
  );

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
          installed={installed}
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
