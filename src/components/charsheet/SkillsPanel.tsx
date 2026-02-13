import { useState, useRef } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { STAT_LABELS } from "@scripts/biomon/types";
import type { StatName } from "@scripts/biomon/types";
import type { SkillStat } from "@scripts/skills/catalog";
import { $skillsByStat, setSkillLevel } from "@stores/skills";
import type { SkillEntry } from "@stores/skills";
import { STAT_STORES } from "@stores/stats";
import { Chevron } from "@components/shared/Chevron";
import { $selectedSkill } from "@stores/ui";

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

  return (
    <div
      class={`skill-row${isSelected ? " selected" : ""}`}
      onClick={(e) => {
        $selectedSkill.set(isSelected ? null : name);
      }}
    >
      <input
        type="number"
        class="skill-input"
        value={entry.level}
        min={0}
        max={10}
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
  stat,
  entries,
  collapsed,
  onToggle,
  stablePicks,
}: {
  stat: SkillStat;
  entries: [string, SkillEntry][];
  collapsed: boolean;
  onToggle: () => void;
  stablePicks: Map<string, string>;
}) {
  const topSkill = collapsed ? pickTopSkill(entries, stablePicks, stat) : null;

  return (
    <div class="skill-group">
      <div
        class={`skill-group-header${collapsed ? " collapsed" : ""}`}
        onClick={onToggle}
      >
        <span>
          {GROUP_LABELS[stat]}
          {stat !== "special" && <StatLabel stat={stat} />}
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

interface SkillsListProps {
  filter?: "all" | "my";
}

export const SkillsList = ({ filter = "all" }: SkillsListProps) => {
  const grouped = useStore($skillsByStat);
  const [collapsed, setCollapsed] = useState<Set<SkillStat>>(
    new Set(["special"]),
  );
  const stablePicks = useRef(new Map<string, string>());

  const toggle = (stat: SkillStat) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(stat)) next.delete(stat);
      else next.add(stat);
      return next;
    });
  };

  return (
    <div class="skills-list">
      {STAT_GROUP_ORDER.map((stat) => {
        const raw = grouped[stat];
        if (!raw || raw.length === 0) return null;
        const entries =
          filter === "my" ? raw.filter(([, e]) => e.level > 0) : raw;
        if (entries.length === 0) return null;

        return (
          <SkillGroup
            key={stat}
            stat={stat}
            entries={entries}
            collapsed={collapsed.has(stat)}
            onToggle={() => toggle(stat)}
            stablePicks={stablePicks.current}
          />
        );
      })}
    </div>
  );
};
