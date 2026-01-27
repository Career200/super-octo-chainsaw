import { BODY_PARTS, PART_ABBREV, type BodyPartName } from "../core";

export function getHealthClass(percent: number): string {
  if (percent >= 100) return "health-full";
  if (percent >= 75) return "health-good";
  if (percent >= 50) return "health-worn";
  if (percent >= 25) return "health-damaged";
  return "health-critical";
}

export function getHealthClassFromSP(current: number, max: number): string {
  return getHealthClass((current / max) * 100);
}

export function findMostDamagedPart(
  bodyParts: BodyPartName[],
  spByPart: Partial<Record<BodyPartName, number>>,
  maxSP: number,
): { part: BodyPartName; sp: number } {
  return bodyParts.reduce(
    (worst, part) => {
      const partSP = spByPart[part] ?? maxSP;
      return partSP < worst.sp ? { part, sp: partSP } : worst;
    },
    { part: bodyParts[0], sp: spByPart[bodyParts[0]] ?? maxSP },
  );
}

function applyDamageIndicator(element: HTMLElement, current: number, max: number) {
  const healthClass = getHealthClassFromSP(current, max);
  if (healthClass === "health-damaged" || healthClass === "health-critical") {
    element.classList.add(healthClass);
  }
}

export function renderBodyPartsCoverage(
  bodyParts: BodyPartName[],
  spByPart?: Partial<Record<BodyPartName, number>>,
  spMax?: number,
): HTMLElement {
  const container = document.createElement("div");
  container.className = "body-parts-coverage";

  const isFullBody = bodyParts.length >= BODY_PARTS.length;

  if (isFullBody) {
    const badge = document.createElement("span");
    badge.className = "coverage-badge coverage-full";
    // For full body, use worst part health
    if (spByPart && spMax) {
      const minSP = Math.min(...bodyParts.map((p) => spByPart[p] ?? spMax));
      applyDamageIndicator(badge, minSP, spMax);
    }
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
