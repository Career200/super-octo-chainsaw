import { useStore } from "@nanostores/preact";
import { tabStore } from "@stores/ui";
import { TwoPanelView } from "../shared/TwoPanelView";
import { TabStrip } from "../shared/TabStrip";
import { InventoryPanel } from "./InventoryPanel";
import { ShopPanel } from "./ShopPanel";
import { GearPanel } from "./GearPanel";

const EQUIPMENT_TABS = [
  { id: "gear", label: "Gear" },
  { id: "armor", label: "Armor" },
];

export const EquipmentView = () => {
  const subTab = useStore(tabStore("equipment-sub-tab", "gear"));

  return (
    <>
      <div class="equipment-sub-tabs">
        <TabStrip tabs={EQUIPMENT_TABS} persist="equipment-sub-tab" />
      </div>
      {subTab === "armor" ? (
        <TwoPanelView
          renderFirst={(expanded, onToggle) => (
            <InventoryPanel expanded={expanded} onToggle={onToggle} />
          )}
          renderSecond={(expanded, onToggle) => (
            <ShopPanel expanded={expanded} onToggle={onToggle} />
          )}
        />
      ) : (
        <div class="container">
          <GearPanel />
        </div>
      )}
    </>
  );
};
