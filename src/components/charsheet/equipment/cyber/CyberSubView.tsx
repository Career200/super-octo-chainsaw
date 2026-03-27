import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";

import { Panel } from "@components/charsheet/shared/Panel";
import { TwoPanelView } from "@components/charsheet/shared/TwoPanelView";
import type { CyberCategory } from "@scripts/cyber/catalog";
import {
  $cyberCatalog,
  $hcData,
  $installedByCategory,
  $ownedCyberItems,
} from "@stores/cyber";
import { $selectedCyber, selectCyber } from "@stores/ui";

import { CyberGridPanel, HcRow } from "./CyberGridPanel";
import { CyberListPanel } from "./CyberListPanel";
import type { CyberlimbCell } from "./cyberViewTypes";
import { DEFAULT_LIMBS } from "./cyberViewTypes";

const EMPTY_LIMB_OPTIONS: Record<CyberlimbCell["slot"], never[]> = {
  la: [],
  ra: [],
  ll: [],
  rl: [],
};

export default function CyberSubView() {
  const selectedId = useStore($selectedCyber);
  const catalog = useStore($cyberCatalog);
  const owned = useStore($ownedCyberItems);
  const installedByCategory = useStore($installedByCategory);
  const hcData = useStore($hcData);
  const [activeCategory, setActiveCategory] =
    useState<CyberCategory>("fashionware");
  const [activeSlot, setActiveSlot] = useState<CyberlimbCell["slot"]>("ra");

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
            categories={installedByCategory}
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
