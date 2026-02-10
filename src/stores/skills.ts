import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";
import { $INT } from "./stats";

export interface SkillEntry {
  stat: "INT" | "REF" | "TECH" | "CL" | "LK" | "ATT" | "MA" | "EMP";
  level: number;
  combat?: boolean;
}

export interface SkillsState {
  awarenessNotice: SkillEntry;
  combatSense: SkillEntry;
}

function defaultState(): SkillsState {
  return {
    awarenessNotice: { stat: "INT", level: 0 },
    combatSense: { stat: "INT", level: 0, combat: true },
  };
}

export const $skills = persistentAtom<SkillsState>(
  "character-skills",
  defaultState(),
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  },
);

export const $awareness = computed([$INT, $skills], (int, skills) => ({
  int: int.current,
  awarenessNotice: skills.awarenessNotice.level,
  combatSense: skills.combatSense.level,
  total: int.current + skills.awarenessNotice.level,
  totalCombat:
    int.current + skills.awarenessNotice.level + skills.combatSense.level,
}));

export function setSkillLevel(skill: keyof SkillsState, level: number): void {
  const clamped = Math.max(0, Math.round(level));
  const current = $skills.get();
  $skills.set({
    ...current,
    [skill]: { ...current[skill], level: clamped },
  });
}
