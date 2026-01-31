import { $health } from "@stores/character";
import { $stats } from "@stores/stats";
import {
  renderWoundTracker,
  setupWoundTracker,
  setupStunToggle,
  setupStabilizedToggle,
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

$stats.subscribe(() => {
  renderStats();
});

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  setupWoundTracker();
  setupStunToggle();
  setupStabilizedToggle();
  setupStats();
  setupWoundHelp();
});
