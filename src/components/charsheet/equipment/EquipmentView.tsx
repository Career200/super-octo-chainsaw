import { useStore } from "@nanostores/preact";
import { lazy, Suspense } from "preact/compat";

import { $eurodollars, setEurodollars } from "@stores/gear";
import { tabStore } from "@stores/ui";

import { TabStrip } from "../shared/TabStrip";

const ArmorSubView = lazy(() => import("./ArmorSubView"));
const WeaponsSubView = lazy(() => import("./WeaponsSubView"));
const GearPanel = lazy(() => import("./GearPanel"));

const EQUIPMENT_TABS = [
  { id: "gear", label: "Gear" },
  { id: "weapons", label: "Weapons" },
  { id: "armor", label: "Armor" },
];

export default function EquipmentView() {
  const subTab = useStore(tabStore("equipment-sub-tab", "gear"));
  const eb = useStore($eurodollars);

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
      <Suspense fallback={null}>
        {subTab === "armor" ? (
          <ArmorSubView />
        ) : subTab === "weapons" ? (
          <WeaponsSubView />
        ) : (
          <div class="container">
            <GearPanel />
          </div>
        )}
      </Suspense>
    </>
  );
}
