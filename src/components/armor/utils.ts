import { BODY_PARTS, PART_ABBREV, type BodyPartName } from "@scripts/armor/core";

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

export function formatCoverage(
  bodyParts: BodyPartName[],
  spByPart?: Partial<Record<BodyPartName, number>>,
  spMax?: number,
): { label: string; class: string }[] {
  const isFullBody = bodyParts.length >= BODY_PARTS.length;

  if (isFullBody && !spByPart) {
    return [{ label: "Full", class: "coverage-badge coverage-full" }];
  }

  return bodyParts.map((part) => {
    let cls = "coverage-badge";
    if (spByPart && spMax) {
      const condCls = getConditionClassFromSP(spByPart[part] ?? spMax, spMax);
      if (condCls === "condition-damaged" || condCls === "condition-critical") {
        cls += ` ${condCls}`;
      }
    }
    return { label: PART_ABBREV[part], class: cls };
  });
}
