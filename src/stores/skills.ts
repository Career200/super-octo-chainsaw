import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";
import { $INT } from "./stats";
import {
  SKILL_CATALOG,
  COMBAT_SKILLS_ORDER,
  AWARENESS_SKILL,
  COMBAT_SENSE_SKILL,
} from "@scripts/skills/catalog";
import type { SkillStat } from "@scripts/skills/catalog";

export interface SkillEntry {
  stat: SkillStat;
  level: number;
  combat: boolean;
}

export type SkillsState = Record<string, SkillEntry>;

function buildDefaults(): SkillsState {
  const skills: SkillsState = {};
  for (const [name, def] of Object.entries(SKILL_CATALOG)) {
    skills[name] = { stat: def.stat, level: 0, combat: def.combat };
  }
  return skills;
}

const DEFAULTS = buildDefaults();

function decodeSkills(raw: string): SkillsState {
  try {
    return JSON.parse(raw);
  } catch {
    // if anything is off - reset to defaults
    return DEFAULTS;
  }
}

export const $skills = persistentAtom<SkillsState>(
  "character-skills",
  DEFAULTS,
  {
    encode: JSON.stringify,
    decode: decodeSkills,
  },
);

// --- Actions ---

export function setSkillLevel(name: string, level: number): void {
  const current = $skills.get();
  if (!(name in current)) return;
  const clamped = Math.max(0, Math.min(10, Math.round(level)));
  $skills.set({
    ...current,
    [name]: { ...current[name], level: clamped },
  });
}

function normalizeKey(name: string): string {
  return name.replace(/\s+/g, "").toLowerCase();
}

export function addSkill(
  name: string,
  stat: SkillStat,
  combat: boolean,
): boolean {
  const current = $skills.get();
  const key = normalizeKey(name);
  for (const existing of Object.keys(current)) {
    if (normalizeKey(existing) === key) return false;
  }
  $skills.set({ ...current, [name]: { stat, level: 0, combat } });
  return true;
}

export function removeSkill(name: string): void {
  const current = $skills.get();
  if (!(name in current)) return;
  const { [name]: _, ...rest } = current;
  $skills.set(rest);
}

export function updateSkill(
  name: string,
  updates: Partial<Pick<SkillEntry, "stat" | "combat">>,
): void {
  const current = $skills.get();
  if (!(name in current)) return;
  $skills.set({
    ...current,
    [name]: { ...current[name], ...updates },
  });
}

// --- Computed Stores ---

export const $awareness = computed([$INT, $skills], (int, skills) => {
  const awn = skills[AWARENESS_SKILL]?.level ?? 0;
  const cs = skills[COMBAT_SENSE_SKILL]?.level ?? 0;
  return {
    int: int.current,
    awarenessNotice: awn,
    combatSense: cs,
    total: int.current + awn,
    totalCombat: int.current + awn + cs,
  };
});

export const $skillsByStat = computed($skills, (skills) => {
  const grouped: Record<SkillStat, [string, SkillEntry][]> = {
    special: [],
    ref: [],
    int: [],
    cl: [],
    tech: [],
    lk: [],
    att: [],
    ma: [],
    emp: [],
    bt: [],
  };
  for (const [name, entry] of Object.entries(skills)) {
    grouped[entry.stat].push([name, entry]);
  }
  for (const entries of Object.values(grouped)) {
    entries.sort((a, b) => a[0].localeCompare(b[0]));
  }
  return grouped;
});

const combatOrderIndex = new Map(
  COMBAT_SKILLS_ORDER.map((name, i) => [name, i]),
);

export const $combatSkills = computed($skills, (skills) => {
  const combat: [string, SkillEntry][] = [];
  for (const [name, entry] of Object.entries(skills)) {
    if (entry.combat) combat.push([name, entry]);
  }
  combat.sort((a, b) => {
    const ai = combatOrderIndex.get(a[0]) ?? Infinity;
    const bi = combatOrderIndex.get(b[0]) ?? Infinity;
    if (ai !== bi) return ai - bi;
    return a[0].localeCompare(b[0]);
  });
  return combat;
});
