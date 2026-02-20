import { useStore } from "@nanostores/preact";

import {
  $ownedArmor,
  getAllOwnedArmor,
  isImplant,
  unwearAll,
} from "@stores/armor";
import { $selectedArmor, selectArmor, tabStore } from "@stores/ui";

import { HelpPopover } from "../shared/HelpPopover";
import { Panel } from "../shared/Panel";
import { TabStrip } from "../shared/TabStrip";
import { TwoPanelView } from "../shared/TwoPanelView";

import { ArmorListPanel } from "./ArmorListPanel";
import { BodyPartGrid } from "./body/BodyPartGrid";
import { GearPanel } from "./GearPanel";
import { ArmorHelpContent } from "./help/ArmorHelpContent";
import { WeaponListPanel } from "./WeaponListPanel";

const EQUIPMENT_TABS = [
  { id: "gear", label: "Gear" },
  { id: "weapons", label: "Weapons" },
  { id: "armor", label: "Armor" },
];

export const EquipmentView = () => {
  const subTab = useStore(tabStore("equipment-sub-tab", "gear"));
  const selectedArmorId = useStore($selectedArmor);
  useStore($ownedArmor); // subscribe so hasWorn recalculates on armor changes
  const hasWorn =
    subTab === "armor" &&
    getAllOwnedArmor().some((a) => a.worn && !isImplant(a));

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
              title={
                <>
                  Body Armor{" "}
                  <HelpPopover
                    id="armor-help-eq"
                    content={<ArmorHelpContent />}
                  />
                </>
              }
              expanded={expanded}
              onToggle={onToggle}
              headerActions={
                hasWorn ? (
                  <button class="btn-ghost btn-sm" onClick={() => unwearAll()}>
                    Remove All
                  </button>
                ) : undefined
              }
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
