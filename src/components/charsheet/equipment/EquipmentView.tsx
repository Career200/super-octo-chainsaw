import { useStore } from "@nanostores/preact";

import {
  $ownedArmor,
  getAllOwnedArmor,
  isImplant,
  unwearAll,
} from "@stores/armor";
import { $eurodollars, setEurodollars } from "@stores/gear";
import { $selectedArmor, selectArmor, tabStore } from "@stores/ui";

import { HelpPopover } from "../shared/HelpPopover";
import { Panel } from "../shared/Panel";
import { TabStrip } from "../shared/TabStrip";
import { TwoPanelView } from "../shared/TwoPanelView";

import { AmmoListPanel } from "./AmmoListPanel";
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

export default function EquipmentView() {
  const subTab = useStore(tabStore("equipment-sub-tab", "gear"));
  const eb = useStore($eurodollars);
  const selectedArmorId = useStore($selectedArmor);
  useStore($ownedArmor); // subscribe so hasWorn recalculates on armor changes
  const hasWorn =
    subTab === "armor" &&
    getAllOwnedArmor().some((a) => a.worn && !isImplant(a));

  return (
    <>
      <div class="equipment-sub-tabs">
        <TabStrip tabs={EQUIPMENT_TABS} persist="equipment-sub-tab" />
        <label class="eb-input">
          <input
            type="number"
            placeholder="Eurodollars"
            value={eb}
            onInput={(e) =>
              setEurodollars(
                parseInt((e.target as HTMLInputElement).value, 10) || 0,
              )
            }
          />
          <span class="cash">{"\u156E\u1572"}</span>
        </label>
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
        <TwoPanelView
          renderFirst={(expanded, onToggle) => (
            <WeaponListPanel expanded={expanded} onToggle={onToggle} />
          )}
          renderSecond={(expanded, onToggle) => (
            <AmmoListPanel expanded={expanded} onToggle={onToggle} />
          )}
        />
      ) : (
        <div class="container">
          <GearPanel />
        </div>
      )}
    </>
  );
}
