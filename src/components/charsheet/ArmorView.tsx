import { DamageHistoryPanel } from "../armor/DamageHistoryPanel";
import { CharacterArmorPanel } from "../armor/CharacterArmorPanel";
import { InventoryPanel } from "../armor/InventoryPanel";
import { ShopPanel } from "../armor/ShopPanel";

export const ArmorView = () => {
  return (
    <div class="container">
      <DamageHistoryPanel />
      <CharacterArmorPanel />
      <InventoryPanel />
      <ShopPanel />
    </div>
  );
};
