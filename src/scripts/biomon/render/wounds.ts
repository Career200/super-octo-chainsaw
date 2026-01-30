import {
  WOUND_LEVELS,
  WOUND_LEVEL_NAMES,
  BOXES_PER_LEVEL,
  type WoundLevel,
} from "@scripts/biomon/types";
import { $health } from "@stores/character";
import { setDamage, syncStunToPhysical } from "@stores/health";

let showStun = false;

function createWoundBox(
  index: number,
  type: "physical" | "stun",
  filled: boolean,
): HTMLElement {
  const box = document.createElement("div");
  box.className = `wound-box ${filled ? "filled" : ""}`;
  box.dataset.index = String(index);
  box.dataset.type = type;
  return box;
}

function createLevelGroup(
  level: WoundLevel,
  levelIndex: number,
  physical: number,
  stun: number,
): HTMLElement {
  const group = document.createElement("div");
  group.className = "wound-level-group";

  const label = document.createElement("div");
  label.className = "wound-level-label";
  label.textContent = WOUND_LEVEL_NAMES[level];
  group.appendChild(label);

  const boxes = document.createElement("div");
  boxes.className = "wound-boxes";

  const physicalTrack = document.createElement("div");
  physicalTrack.className = "wound-track wound-track-physical";

  const stunTrack = document.createElement("div");
  stunTrack.className = "wound-track wound-track-stun";

  const startBox = levelIndex * BOXES_PER_LEVEL;

  for (let i = 0; i < BOXES_PER_LEVEL; i++) {
    const boxIndex = startBox + i + 1;
    const physicalFilled = physical >= boxIndex;
    const stunFilled = stun >= boxIndex;

    physicalTrack.appendChild(
      createWoundBox(boxIndex, "physical", physicalFilled),
    );
    stunTrack.appendChild(createWoundBox(boxIndex, "stun", stunFilled));
  }

  boxes.appendChild(physicalTrack);
  boxes.appendChild(stunTrack);
  group.appendChild(boxes);

  return group;
}

export function renderWoundTracker(): void {
  const container = document.getElementById("wound-tracker");
  if (!container) return;

  const state = $health.get();

  container.innerHTML = "";
  container.classList.toggle("show-stun", showStun);

  WOUND_LEVELS.forEach((level, index) => {
    container.appendChild(
      createLevelGroup(level, index, state.physical, state.stun),
    );
  });
}

export function setupWoundTracker(): void {
  const container = document.getElementById("wound-tracker");
  if (!container) return;

  container.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains("wound-box")) return;

    const index = parseInt(target.dataset.index || "0", 10);
    const type = target.dataset.type as "physical" | "stun";

    if (type === "stun" && !showStun) return;

    const state = $health.get();
    const currentValue = type === "physical" ? state.physical : state.stun;

    const syncStun = type === "physical" && !showStun;

    if (currentValue >= index) {
      setDamage(index - 1, type, syncStun);
    } else {
      setDamage(index, type, syncStun);
    }
  });
}

export function setupStunToggle(): void {
  const toggle = document.getElementById("stun-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    showStun = !showStun;
    toggle.classList.toggle("active", showStun);
    document.body.classList.toggle("show-stun", showStun);

    if (!showStun) {
      syncStunToPhysical();
    }

    renderWoundTracker();
  });
}
