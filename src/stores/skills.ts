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
  description?: string;
}

export type SkillsState = Record<string, SkillEntry>;

/**
 * Persistence model: only store what differs from catalog defaults.
 * - Default (catalog) skills: stored only when level > 0 (name + level; stat/combat come from catalog)
 * - Custom skills: always stored (name, stat, level, combat)
 * On load, if the stored shape looks like the old format (all catalog skills at level 0), drop it.
 */

function isValidNewFormat(data: unknown): data is SkillsState {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const entries = Object.entries(data as Record<string, unknown>);
  // Old format: every catalog skill present at level 0 → invalid
  if (entries.length >= Object.keys(SKILL_CATALOG).length) {
    const allCatalogAtZero = Object.keys(SKILL_CATALOG).every((name) => {
      const e = (data as Record<string, SkillEntry>)[name];
      return e && e.level === 0;
    });
    if (allCatalogAtZero) return false;
  }
  // Validate shape of each entry
  for (const [, entry] of entries) {
    if (!entry || typeof entry !== "object") return false;
    const e = entry as Record<string, unknown>;
    if (typeof e.stat !== "string" || typeof e.level !== "number" || typeof e.combat !== "boolean") return false;
  }
  return true;
}

function decodeSkills(raw: string): SkillsState {
  try {
    const parsed = JSON.parse(raw);
    if (isValidNewFormat(parsed)) return parsed;
    return {};
  } catch {
    return {};
  }
}

export const $skills = persistentAtom<SkillsState>(
  "character-skills",
  {},
  {
    encode: JSON.stringify,
    decode: decodeSkills,
  },
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
        [name]: { stat: catalogDef.stat, level: clamped, combat: catalogDef.combat },
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

function normalizeKey(name: string): string {
  return name.replace(/\s+/g, "").toLowerCase();
}

export function addSkill(
  name: string,
  stat: SkillStat,
  combat: boolean,
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
  const entry: SkillEntry = { stat, level: 0, combat };
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
  updates: Partial<Pick<SkillEntry, "stat" | "combat" | "description">>,
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
      combat: def.combat,
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

const combatOrderIndex = new Map(
  COMBAT_SKILLS_ORDER.map((name, i) => [name, i]),
);

export const $combatSkills = computed($allSkills, (skills) => {
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
