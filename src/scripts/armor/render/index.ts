import { setupCollapsiblePanels } from "./panels";
import { setupHitButton } from "./hit-popover";
import { setupArmorHelp } from "../help";

document.addEventListener("DOMContentLoaded", () => {
  setupCollapsiblePanels();
  setupHitButton();
  setupArmorHelp();
});
