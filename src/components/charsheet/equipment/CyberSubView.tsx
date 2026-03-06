import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";

import { $selectedCyber, selectCyber } from "@stores/ui";

import { Panel } from "../shared/Panel";
import { TwoPanelView } from "../shared/TwoPanelView";

import { CyberGridPanel, HcRow } from "./CyberGridPanel";
import { CyberListPanel } from "./CyberListPanel";
import type { CyberCategory, CyberlimbCell } from "./cyberMockData";
import {
  CATEGORY_ORDER,
  MOCK_CATALOG,
  MOCK_HC,
  MOCK_INSTALLED,
  MOCK_LIMBS,
} from "./cyberMockData";

const installedByCategory = CATEGORY_ORDER.map((cat) => ({
  category: cat,
  items: MOCK_INSTALLED.filter((i) => i.category === cat),
})).filter(
  ({ category, items }) => category === "cyberlimbs" || items.length > 0,
);

export default function CyberSubView() {
  const selectedId = useStore($selectedCyber);
  const [activeCategory, setActiveCategory] =
    useState<CyberCategory>("neuralware");
  const [activeSlot, setActiveSlot] = useState<CyberlimbCell["slot"]>("ra");

  const handleItemClick = (item: { id: string; category: CyberCategory }) => {
    selectCyber(selectedId === item.id ? null : item.id);
    setActiveCategory(item.category);
  };

  const handleLimbClick = (limbId: string) => {
    selectCyber(selectedId === limbId ? null : limbId);
    setActiveCategory("cyberlimbs");
    // Extract slot from "limb-ra" → "ra"
    const slot = limbId.replace("limb-", "") as CyberlimbCell["slot"];
    setActiveSlot(slot);
  };

  const handleCategoryChange = (cat: CyberCategory) => {
    setActiveCategory(cat);
    // Pre-select first cyber limb when switching to cyberlimbs
    if (cat === "cyberlimbs") {
      const firstCyber = MOCK_LIMBS.find((l) => l.isCyber);
      if (firstCyber) setActiveSlot(firstCyber.slot);
    }
  };

  return (
    <TwoPanelView
      renderFirst={(expanded, onToggle) => (
        <Panel
          id="cyber-grid-panel"
          title={<HcRow hcData={MOCK_HC} />}
          expanded={expanded}
          onToggle={onToggle}
        >
          <CyberGridPanel
            categories={installedByCategory}
            limbs={MOCK_LIMBS}
            selectedId={selectedId}
            onItemClick={handleItemClick}
            onLimbClick={handleLimbClick}
            onCategoryClick={handleCategoryChange}
          />
        </Panel>
      )}
      renderSecond={(expanded, onToggle) => (
        <CyberListPanel
          expanded={expanded}
          onToggle={onToggle}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          activeSlot={activeSlot}
          onSlotChange={setActiveSlot}
          limbs={MOCK_LIMBS}
          catalog={MOCK_CATALOG}
          installed={MOCK_INSTALLED}
          selectedId={selectedId}
          onSelect={(id) => selectCyber(selectedId === id ? null : id)}
        />
      )}
    />
  );
}
