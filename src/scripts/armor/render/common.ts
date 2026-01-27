import { BODY_PARTS, PART_ABBREV, type BodyPartName } from "../core";

export function getHealthClass(percent: number): string {
  if (percent >= 100) return "health-full";
  if (percent >= 75) return "health-good";
  if (percent >= 50) return "health-worn";
  if (percent >= 25) return "health-damaged";
  return "health-critical";
}

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
