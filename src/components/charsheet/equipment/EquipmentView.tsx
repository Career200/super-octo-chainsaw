import { InventoryPanel } from "./InventoryPanel";
import { ShopPanel } from "./ShopPanel";

export const EquipmentView = () => {
  return (
    <div class="container">
      <InventoryPanel />
      <ShopPanel />
    </div>
  );
};
