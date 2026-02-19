import { useStore } from "@nanostores/preact";
import { $ownedArmor, getAllOwnedArmor, isImplant, unwearAll } from "@stores/armor";
import { tabStore, $selectedArmor, selectArmor } from "@stores/ui";
import { TwoPanelView } from "../shared/TwoPanelView";
import { HelpPopover } from "../shared/HelpPopover";
import { TabStrip } from "../shared/TabStrip";
import { ArmorListPanel } from "./ArmorListPanel";
import { GearPanel } from "./GearPanel";
import { WeaponListPanel } from "./WeaponListPanel";
import { BodyPartGrid } from "./body/BodyPartGrid";
import { ArmorHelpContent } from "./help/ArmorHelpContent";
import { Panel } from "../shared/Panel";

const EQUIPMENT_TABS = [
  { id: "gear", label: "Gear" },
  { id: "weapons", label: "Weapons" },
  { id: "armor", label: "Armor" },
];

export const EquipmentView = () => {
  const subTab = useStore(tabStore("equipment-sub-tab", "gear"));
  const selectedArmorId = useStore($selectedArmor);
  useStore($ownedArmor); // subscribe so hasWorn recalculates on armor changes
  const hasWorn = subTab === "armor" && getAllOwnedArmor().some((a) => a.worn && !isImplant(a));

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
              title={<>Body Armor{" "}<HelpPopover id="armor-help-eq" content={<ArmorHelpContent />} /></>}
              expanded={expanded}
              onToggle={onToggle}
              headerActions={hasWorn ? <button class="btn-ghost btn-sm" onClick={() => unwearAll()}>Remove All</button> : undefined}
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
      ) : subTab === "weapons" ? (
        <div class="container">
          <WeaponListPanel />
        </div>
      ) : (
        <div class="container">
          <GearPanel />
        </div>
      )}
    </>
  );
};
