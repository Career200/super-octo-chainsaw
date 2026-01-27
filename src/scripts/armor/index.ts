import { $ownedArmor } from "../../stores/armor";
import { renderEffectiveSP, renderLayers, renderEV } from "./render/body";
import { renderOwnedInventory } from "./render/inventory";
import { renderShop } from "./render/shop";
import { initHistory } from "./render/history";
import {
  renderArmorSummary,
  updateOwnedSummary,
  setupCollapsiblePanels,
} from "./panels";
import { setupHitButton } from "./hit";
import { setupArmorHelp } from "./help";

function renderAll() {
  renderOwnedInventory();
  renderShop();
  renderEffectiveSP();
  renderLayers();
  renderEV();
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
  setupHitButton();
  setupArmorHelp();
  initHistory();
});
