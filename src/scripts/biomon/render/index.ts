import { $health } from "@stores/character";
import {
  renderWoundTracker,
  setupWoundTracker,
  setupStunToggle,
} from "./wounds";
import { setupWoundHelp } from "../help";

function renderAll() {
  renderWoundTracker();
}

$health.subscribe(() => {
  renderAll();
});

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  setupWoundTracker();
  setupStunToggle();
  setupWoundHelp();
});
