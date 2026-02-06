import { BODY_PARTS, PART_ABBREV, type BodyPartName } from "../core";

export function getConditionClass(percent: number): string {
  if (percent >= 100) return "condition-full";
  if (percent >= 75) return "condition-good";
  if (percent >= 50) return "condition-worn";
  if (percent >= 25) return "condition-damaged";
  return "condition-critical";
}

export function getConditionClassFromSP(current: number, max: number): string {
  return getConditionClass((current / max) * 100);
}

export function getLowestSP(
  bodyParts: BodyPartName[],
  spByPart: Partial<Record<BodyPartName, number>>,
  maxSP: number,
): number {
  return Math.min(...bodyParts.map((p) => spByPart[p] ?? maxSP));
}

function applyDamageIndicator(
  element: HTMLElement,
  current: number,
  max: number,
) {
  const healthClass = getConditionClassFromSP(current, max);
  if (healthClass === "condition-damaged" || healthClass === "condition-critical") {
    element.classList.add(healthClass);
  }
}

export function renderBodyPartsCoverage(
  bodyParts: BodyPartName[],
  spByPart?: Partial<Record<BodyPartName, number>>,
  spMax?: number,
): HTMLElement {
  const container = document.createElement("div");
  container.className = "flex-end gap-4 body-parts-coverage";

  const isFullBody = bodyParts.length >= BODY_PARTS.length;
  const useFullShorthand = isFullBody && !spByPart;

  if (useFullShorthand) {
    const badge = document.createElement("span");
    badge.className = "coverage-badge coverage-full";
    badge.textContent = "Full";
    container.appendChild(badge);
  } else {
    for (const part of bodyParts) {
      const badge = document.createElement("span");
      badge.className = "coverage-badge";
      if (spByPart && spMax) {
        applyDamageIndicator(badge, spByPart[part] ?? spMax, spMax);
      }
      badge.textContent = PART_ABBREV[part];
      badge.title = part.replaceAll("_", " ");
      container.appendChild(badge);
    }
  }

  return container;
}
