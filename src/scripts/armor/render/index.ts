import { $ownedArmor } from "../../../stores/character";
import { renderEffectiveSP, renderLayers, renderEV, renderFaceSP, setupFaceHelp } from "./body";
import { renderOwnedInventory } from "./inventory";
import { renderShop } from "./shop";
import { initHistory } from "./history";
import { setupSkinweave, setupImplants, renderSkinweave } from "./cyberware";
import { setupCollapsiblePanels } from "./panels";
import { setupHitButton } from "./hit-popover";
import { setupArmorHelp } from "../help";

function renderAll() {
  renderOwnedInventory();
  renderShop();
  renderEffectiveSP();
  renderFaceSP();
  renderLayers();
  renderEV();
  renderSkinweave();
}

// Subscribe to store changes - skinweave is now part of $ownedArmor
$ownedArmor.subscribe(() => {
  renderAll();
});

// Initial render and setup
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  setupCollapsiblePanels();
  setupHitButton();
  setupArmorHelp();
  setupFaceHelp();
  setupSkinweave();
  setupImplants();
  initHistory();
});
