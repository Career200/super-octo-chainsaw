import { $ownedArmor } from "../../../stores/character";
import { renderOwnedInventory } from "./inventory";
import { renderShop } from "./shop";
import { initHistory } from "./history";
import { setupCollapsiblePanels } from "./panels";
import { setupHitButton } from "./hit-popover";
import { setupArmorHelp } from "../help";

function renderAll() {
  renderOwnedInventory();
  renderShop();
}

// Subscribe to store changes
$ownedArmor.subscribe(() => {
  renderAll();
});

// Initial render and setup
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  setupCollapsiblePanels();
  setupHitButton();
  setupArmorHelp();
  initHistory();
});
