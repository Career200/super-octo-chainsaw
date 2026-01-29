import { $ownedArmor } from "../../stores/armor";
import { renderEffectiveSP, renderLayers, renderEV } from "./render/body";
import { renderOwnedInventory } from "./render/inventory";
import { renderShop } from "./render/shop";
import { initHistory } from "./render/history";
import {
  setupSkinweave,
  setupImplants,
  renderSkinweave,
} from "./render/cyberware";
import {
  renderArmorSummary,
  updateOwnedSummary,
  setupCollapsiblePanels,
} from "./render/panels";
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
  setupSkinweave();
  setupImplants();
  initHistory();
});
