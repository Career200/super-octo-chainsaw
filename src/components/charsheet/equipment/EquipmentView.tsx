import { useStore } from "@nanostores/preact";
import { tabStore, $selectedArmor, selectArmor } from "@stores/ui";
import { TwoPanelView } from "../shared/TwoPanelView";
import { TabStrip } from "../shared/TabStrip";
import { ArmorListPanel } from "./ArmorListPanel";
import { GearPanel } from "./GearPanel";
import { BodyPartGrid } from "./body/BodyPartGrid";
import { Panel } from "../shared/Panel";

const EQUIPMENT_TABS = [
  { id: "gear", label: "Gear" },
  { id: "armor", label: "Armor" },
];

export const EquipmentView = () => {
  const subTab = useStore(tabStore("equipment-sub-tab", "gear"));
  const selectedArmorId = useStore($selectedArmor);

  return (
    <>
      <div class="equipment-sub-tabs">
        <TabStrip tabs={EQUIPMENT_TABS} persist="equipment-sub-tab" />
      </div>
      {subTab === "armor" ? (
        <TwoPanelView
          renderFirst={(expanded, onToggle) => (
            <Panel
              id="armor-grid-panel"
              title="Body Armor"
              expanded={expanded}
              onToggle={onToggle}
            >
              <BodyPartGrid mode="inventory" />
            </Panel>
          )}
          renderSecond={(expanded, onToggle) => (
            <ArmorListPanel
              expanded={expanded}
              onToggle={onToggle}
              selectedId={selectedArmorId}
              onSelect={(id) => selectArmor(id)}
            />
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
