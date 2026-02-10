import { DamageHistoryPanel } from "../armor/DamageHistoryPanel";
import { InventoryPanel } from "../armor/InventoryPanel";
import { ShopPanel } from "../armor/ShopPanel";

export const ArmorView = () => {
  return (
    <div class="container">
      <DamageHistoryPanel />
      <InventoryPanel />
      <ShopPanel />
    </div>
  );
};
