import { BODY_PARTS, type BodyPartName } from "../core";

const PART_ABBREV: Record<BodyPartName, string> = {
  head: "H",
  torso: "T",
  left_arm: "LA",
  right_arm: "RA",
  left_leg: "LL",
  right_leg: "RL",
};

export function renderBodyPartsCoverage(
  bodyParts: BodyPartName[],
): HTMLElement {
  const container = document.createElement("div");
  container.className = "body-parts-coverage";

  const isFullBody = BODY_PARTS.every((part) => bodyParts.includes(part));

  if (isFullBody) {
    const badge = document.createElement("span");
    badge.className = "coverage-badge coverage-full";
    badge.textContent = "Full";
    container.appendChild(badge);
  } else {
    for (const part of bodyParts) {
      const badge = document.createElement("span");
      badge.className = "coverage-badge";
      badge.textContent = PART_ABBREV[part];
      badge.title = part.replaceAll("_", " ");
      container.appendChild(badge);
    }
  }

  return container;
}
