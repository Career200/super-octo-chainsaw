import { $ownedArmor } from "../../stores/armor";
import { renderEffectiveSP, renderLayers } from "./render/body";
import { renderOwnedInventory } from "./render/inventory";
import { renderShop } from "./render/shop";
import {
  renderArmorSummary,
  updateOwnedSummary,
  setupCollapsiblePanels,
} from "./panels";

function renderAll() {
  renderOwnedInventory();
  renderShop();
  renderEffectiveSP();
  renderLayers();
  renderArmorSummary();
  updateOwnedSummary();
}

// Subscribe to store changes
$ownedArmor.subscribe(() => {
  renderAll();
});

// Initial render and setup
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  setupCollapsiblePanels();
});
