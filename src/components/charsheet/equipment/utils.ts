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
