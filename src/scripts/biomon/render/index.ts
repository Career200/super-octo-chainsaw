import { $health } from "../../../stores/health";
import {
  renderWoundTracker,
  setupWoundTracker,
  setupStunToggle,
} from "./wounds";

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
});
