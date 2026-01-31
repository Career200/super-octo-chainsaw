import { $health } from "@stores/character";
import { $stats, $bodyType } from "@stores/stats";
import {
  renderWoundTracker,
  setupWoundTracker,
  setupStunToggle,
  setupStabilizedToggle,
} from "./wounds";
import { renderStats, setupStats } from "./stats";
import { renderBodyInfo } from "./body";
import { setupWoundHelp } from "../help";

function renderAll() {
  renderWoundTracker();
  renderBodyInfo();
  renderStats();
}

$health.subscribe(() => {
  renderAll();
});

$stats.subscribe(() => {
  renderBodyInfo();
  renderStats();
});

$bodyType.subscribe(() => {
  renderBodyInfo();
});

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  setupWoundTracker();
  setupStunToggle();
  setupStabilizedToggle();
  setupStats();
  setupWoundHelp();
});
