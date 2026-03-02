import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";

import { normalizeKey } from "@scripts/catalog-common";
import type { SkillStat } from "@scripts/skills/catalog";
import {
  AWARENESS_SKILL,
  COMBAT_SENSE_SKILL,
  MELEE_SKILLS_ORDER,
  SKILL_CATALOG,
} from "@scripts/skills/catalog";

import { $INT } from "./stats";

export interface SkillEntry {
  stat: SkillStat;
  level: number;
  melee: boolean;
  description?: string;
}

export type SkillsState = Record<string, SkillEntry>;

import { decodeJson } from "./decode";

export const $skills = persistentAtom<SkillsState>(
  "character-skills",
  {},
  { encode: JSON.stringify, decode: decodeJson<SkillsState>({}) },
);

// --- Helpers ---

export function isCustomSkill(name: string): boolean {
  return !(name in SKILL_CATALOG);
}

// --- Actions ---

export function setSkillLevel(name: string, level: number): void {
  const clamped = Math.max(0, Math.min(10, Math.round(level)));
  const current = $skills.get();

  if (name in SKILL_CATALOG) {
    // Default catalog skill
    if (clamped > 0) {
      // Ensure it's in the store with the correct level
      const catalogDef = SKILL_CATALOG[name];
      $skills.set({
        ...current,
        [name]: {
          stat: catalogDef.stat,
          level: clamped,
          melee: catalogDef.melee,
        },
      });
    } else {
      // Level 0 → remove from store (falls back to catalog default)
      if (name in current) {
        const { [name]: _, ...rest } = current;
        $skills.set(rest);
      }
    }
  } else {
    // Custom skill — must already be in store
    if (!(name in current)) return;
    $skills.set({
      ...current,
      [name]: { ...current[name], level: clamped },
    });
  }
}

export function addSkill(
  name: string,
  stat: SkillStat,
  melee: boolean,
  description?: string,
): boolean {
  const current = $skills.get();
  const key = normalizeKey(name);
  // Check against both store and catalog
  for (const existing of Object.keys(current)) {
    if (normalizeKey(existing) === key) return false;
  }
  for (const existing of Object.keys(SKILL_CATALOG)) {
    if (normalizeKey(existing) === key) return false;
  }
  const entry: SkillEntry = { stat, level: 0, melee };
  if (description) entry.description = description;
  $skills.set({ ...current, [name]: entry });
  return true;
}

export function removeSkill(name: string): void {
  // Guard: refuse to remove catalog skills
  if (name in SKILL_CATALOG) return;
  const current = $skills.get();
  if (!(name in current)) return;
  const { [name]: _, ...rest } = current;
  $skills.set(rest);
}

export function updateSkill(
  name: string,
  updates: Partial<Pick<SkillEntry, "stat" | "melee" | "description">>,
): void {
  const current = $skills.get();
  if (!(name in current)) return;
  $skills.set({
    ...current,
    [name]: { ...current[name], ...updates },
  });
}

// --- Full view: merges catalog defaults with stored overrides ---

/** Returns the full skills map: all catalog skills (hydrated with stored levels) + all custom skills. */
export const $allSkills = computed($skills, (stored) => {
  const result: SkillsState = {};
  // Catalog skills: use stored level if present, else level 0
  for (const [name, def] of Object.entries(SKILL_CATALOG)) {
    const override = stored[name];
    result[name] = {
      stat: def.stat,
      level: override?.level ?? 0,
      melee: def.melee,
    };
  }
  // Custom skills: everything in store that's not in catalog
  for (const [name, entry] of Object.entries(stored)) {
    if (!(name in SKILL_CATALOG)) {
      result[name] = entry;
    }
  }
  return result;
});

// --- Computed Stores ---

export const $awareness = computed([$INT, $allSkills], (int, skills) => {
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

export const $skillTotal = computed($allSkills, (skills) => {
  let total = 0;
  for (const entry of Object.values(skills)) {
    total += entry.level;
  }
  return total;
});

export const $skillsByStat = computed($allSkills, (skills) => {
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

const meleeOrderIndex = new Map(
  MELEE_SKILLS_ORDER.map((name, i) => [name, i]),
);

export const $meleeSkills = computed($allSkills, (skills) => {
  const melee: [string, SkillEntry][] = [];
  for (const [name, entry] of Object.entries(skills)) {
    if (entry.melee) melee.push([name, entry]);
  }
  melee.sort((a, b) => {
    const ai = meleeOrderIndex.get(a[0]) ?? Infinity;
    const bi = meleeOrderIndex.get(b[0]) ?? Infinity;
    if (ai !== bi) return ai - bi;
    return a[0].localeCompare(b[0]);
  });
  return melee;
});

/** Skills for the "My" tab: all skills with level > 0 */
export const $mySkills = computed($allSkills, (skills) => {
  const result: [string, SkillEntry][] = [];
  for (const [name, entry] of Object.entries(skills)) {
    if (entry.level > 0) result.push([name, entry]);
  }
  return result;
});

/** Count of skills with level > 0 */
export const $mySkillsCount = computed($mySkills, (skills) => skills.length);

/** Custom skills only (non-catalog entries from $skills store) */
export const $customSkills = computed($skills, (stored) => {
  const result: [string, SkillEntry][] = [];
  for (const [name, entry] of Object.entries(stored)) {
    if (!(name in SKILL_CATALOG)) result.push([name, entry]);
  }
  return result;
});
