import { useStore } from "@nanostores/preact";
import { $equipmentSubTab } from "@stores/ui";
import type { EquipmentSubTab } from "@stores/ui";
import { TwoPanelView } from "../shared/TwoPanelView";
import { InventoryPanel } from "./InventoryPanel";
import { ShopPanel } from "./ShopPanel";
import { GearPanel } from "./GearPanel";

export const EquipmentView = () => {
  const subTab = useStore($equipmentSubTab);

  return (
    <>
      <div class="equipment-sub-tabs">
        <span class="tab-strip">
          {(["gear", "armor"] as const).map((t) => (
            <button
              key={t}
              class={subTab === t ? "active" : ""}
              onClick={() => $equipmentSubTab.set(t as EquipmentSubTab)}
            >
              {t === "armor" && "Armor"}
              {t === "gear" && "Gear"}
            </button>
          ))}
        </span>
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
