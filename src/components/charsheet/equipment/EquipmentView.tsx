import { TwoPanelView } from "../shared/TwoPanelView";
import { InventoryPanel } from "./InventoryPanel";
import { ShopPanel } from "./ShopPanel";

export const EquipmentView = () => (
  <TwoPanelView
    renderFirst={(expanded, onToggle) => (
      <InventoryPanel expanded={expanded} onToggle={onToggle} />
    )}
    renderSecond={(expanded, onToggle) => (
      <ShopPanel expanded={expanded} onToggle={onToggle} />
    )}
  />
);
