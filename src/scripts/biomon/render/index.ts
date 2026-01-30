import { $health } from "@stores/character";
import { $REF } from "@stores/stats";
import {
  renderWoundTracker,
  setupWoundTracker,
  setupStunToggle,
} from "./wounds";
import { renderStats, setupStats } from "./stats";
import { setupWoundHelp } from "../help";

function renderAll() {
  renderWoundTracker();
  renderStats();
}

$health.subscribe(() => {
  renderAll();
});

$REF.subscribe(() => {
  renderStats();
});

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  setupWoundTracker();
  setupStunToggle();
  setupStats();
  setupWoundHelp();
});
