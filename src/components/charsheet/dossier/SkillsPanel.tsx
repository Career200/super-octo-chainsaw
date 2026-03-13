import { useStore } from "@nanostores/preact";
import { useRef, useState } from "preact/hooks";

import type { StatName } from "@scripts/combat/types";
import { STAT_LABELS } from "@scripts/combat/types";
import type { SkillStat } from "@scripts/skills/catalog";
import type { SkillEntry } from "@stores/skills";
import {
  $allSkills,
  $customSkills,
  $mySkills,
  setSkillLevel,
} from "@stores/skills";
import { STAT_STORES } from "@stores/stats";
import { $selectedSkill, selectSkill, startAddingSkill } from "@stores/ui";

import { Chevron } from "../shared/Chevron";
import { useScrollOnSelect } from "../shared/useScrollOnSelect";
export type SkillFilter = "catalog" | "custom" | "my";

const STAT_GROUP_ORDER: SkillStat[] = [
  "special",
  "int",
  "att",
  "cl",
  "tech",
  "bt",
  "emp",
  "ref",
];

const GROUP_LABELS: Record<SkillStat, string> = {
  ...STAT_LABELS,
  special: "SPECIAL",
};

/** Pick the skill with the highest level. Ties resolved randomly (stable via ref). */
function pickTopSkill(
  entries: [string, SkillEntry][],
  stableRef: Map<string, string>,
  groupKey: string,
): [string, SkillEntry] {
  let maxLevel = -1;
  for (const [, e] of entries) {
    if (e.level > maxLevel) maxLevel = e.level;
  }
  const candidates = entries.filter(([, e]) => e.level === maxLevel);
  if (candidates.length === 1) return candidates[0];

  // Use stored pick if still valid
  const prev = stableRef.get(groupKey);
  const prevMatch = prev && candidates.find(([n]) => n === prev);
  if (prevMatch) return prevMatch;

  // New random pick, store it
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  stableRef.set(groupKey, pick[0]);
  return pick;
}

/** Subscribes to a single stat store — only re-renders when that stat changes. */
function StatLabel({ stat }: { stat: StatName }) {
  const sv = useStore(STAT_STORES[stat]);
  const label =
    sv.total === sv.current ? `${sv.total}` : `${sv.total}/${sv.current}`;
  return <span class="skill-group-stat-value">{label}</span>;
}

function SkillRow({ name, entry }: { name: string; entry: SkillEntry }) {
  const selected = useStore($selectedSkill);
  const isSelected = selected === name;
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRef = useScrollOnSelect<HTMLDivElement>(isSelected);

  return (
    <div
      ref={rowRef}
      class={`skill-row${isSelected ? " selected" : ""}`}
      onClick={() => {
        selectSkill(isSelected ? null : name);
        if (!matchMedia("(pointer: coarse)").matches) {
          inputRef.current?.focus();
        }
      }}
    >
      <input
        ref={inputRef}
        type="number"
        class="skill-input"
        value={entry.level}
        min={0}
        max={10}
        onClick={(e) => e.stopPropagation()}
        onInput={(e) => {
          const v = (e.target as HTMLInputElement).value;
          if (v !== "") setSkillLevel(name, Number(v));
        }}
      />
      <span class="skill-name">{name}</span>
    </div>
  );
}

function SkillGroup({
  groupKey,
  label,
  entries,
  collapsed,
  onToggle,
  stablePicks,
}: {
  groupKey: string;
  label?: string;
  entries: [string, SkillEntry][];
  collapsed: boolean;
  onToggle: () => void;
  stablePicks: Map<string, string>;
}) {
  const topSkill = collapsed
    ? pickTopSkill(entries, stablePicks, groupKey)
    : null;

  return (
    <div class="skill-group">
      <div
        class={`skill-group-header${collapsed ? " collapsed" : ""}`}
        onClick={onToggle}
      >
        <span>
          {label ?? GROUP_LABELS[groupKey as SkillStat]}
          {!label && groupKey !== "special" && (
            <StatLabel stat={groupKey as StatName} />
          )}
        </span>
        <Chevron expanded={!collapsed} />
      </div>
      {collapsed ? (
        <>
          <SkillRow name={topSkill![0]} entry={topSkill![1]} />
          {entries.length > 1 && (
            <div class="skill-group-more" onClick={onToggle}>
              +{entries.length - 1} more
            </div>
          )}
        </>
      ) : (
        entries.map(([name, entry]) => (
          <SkillRow key={name} name={name} entry={entry} />
        ))
      )}
    </div>
  );
}

/** Group a flat skill list by stat, separating martial arts into their own group */
function groupSkills(skills: [string, SkillEntry][]) {
  const byStat: Partial<Record<SkillStat, [string, SkillEntry][]>> = {};
  const ma: [string, SkillEntry][] = [];
  for (const pair of skills) {
    if (pair[1].martialArt) ma.push(pair);
    else (byStat[pair[1].stat] ??= []).push(pair);
  }
  for (const entries of Object.values(byStat))
    entries.sort((a, b) => a[0].localeCompare(b[0]));
  ma.sort((a, b) => a[0].localeCompare(b[0]));
  return { byStat, ma };
}

function GroupedSkillsList({
  skills,
  collapsed,
  onToggle,
  stablePicks,
  emptyMessage,
}: {
  skills: [string, SkillEntry][];
  collapsed: Set<string>;
  onToggle: (key: string) => void;
  stablePicks: Map<string, string>;
  emptyMessage?: string;
}) {
  if (skills.length === 0) {
    return <div class="empty-message">{emptyMessage ?? "No skills yet"}</div>;
  }
  const { byStat, ma } = groupSkills(skills);
  return (
    <div class="skills-list">
      {STAT_GROUP_ORDER.map((stat) => {
        const entries = byStat[stat];
        if (!entries || entries.length === 0) return null;
        return (
          <SkillGroup
            key={stat}
            groupKey={stat}
            entries={entries}
            collapsed={collapsed.has(stat)}
            onToggle={() => onToggle(stat)}
            stablePicks={stablePicks}
          />
        );
      })}
      {ma.length > 0 && (
        <SkillGroup
          groupKey="ma-group"
          label="MARTIAL ARTS"
          entries={ma}
          collapsed={collapsed.has("ma-group")}
          onToggle={() => onToggle("ma-group")}
          stablePicks={stablePicks}
        />
      )}
    </div>
  );
}

interface SkillsListProps {
  filter?: SkillFilter;
}

export const SkillsList = ({ filter = "catalog" }: SkillsListProps) => {
  const allSkills = useStore($allSkills);
  const customSkills = useStore($customSkills);
  const mySkills = useStore($mySkills);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(["special"]));
  const stablePicks = useRef(new Map<string, string>());

  const toggle = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const skills =
    filter === "custom"
      ? customSkills
      : filter === "my"
        ? mySkills
        : Object.entries(allSkills);

  return (
    <div>
      {filter === "custom" && (
        <div class="skills-list-toolbar">
          <button
            class="btn-sm add-skill-btn"
            onClick={() => startAddingSkill()}
          >
            + Add Skill
          </button>
        </div>
      )}
      <GroupedSkillsList
        skills={skills}
        collapsed={collapsed}
        onToggle={toggle}
        stablePicks={stablePicks.current}
        emptyMessage={
          filter === "my"
            ? "Set skill levels in the Catalog tab to see them here."
            : undefined
        }
      />
    </div>
  );
};
