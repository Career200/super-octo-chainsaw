import { useState, useRef } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { STAT_LABELS } from "@scripts/biomon/types";
import type { SkillStat } from "@scripts/skills/catalog";
import { $skillsByStat, $skillTotal, setSkillLevel } from "@stores/skills";
import type { SkillEntry } from "@stores/skills";
import { Panel } from "@components/shared/Panel";

const STAT_GROUP_ORDER: SkillStat[] = [
  "special",
  "att",
  "cl",
  "emp",
  "tech",
  "int",
  "ref",
  "bt",
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

function SkillRow({ name, entry }: { name: string; entry: SkillEntry }) {
  return (
    <div class="skill-row">
      <span class="skill-name">{name}</span>
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
    </div>
  );
}

export const SkillsPanel = () => {
  const grouped = useStore($skillsByStat);
  const total = useStore($skillTotal);
  const [collapsed, setCollapsed] = useState<Set<SkillStat>>(new Set());
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
    <Panel id="skills-panel" title={<>Skills <span class="skill-total">{total}</span></>} defaultExpanded>
      <div class="skills-list">
        {STAT_GROUP_ORDER.map((stat) => {
          const entries = grouped[stat];
          if (!entries || entries.length === 0) return null;
          const isCollapsed = collapsed.has(stat);
          const topSkill = isCollapsed
            ? pickTopSkill(entries, stablePicks.current, stat)
            : null;

          return (
            <div class="skill-group" key={stat}>
              <div
                class={`skill-group-header${isCollapsed ? " collapsed" : ""}`}
                onClick={() => toggle(stat)}
              >
                <span>{GROUP_LABELS[stat]}</span>
                <span class="collapse-chevron">
                  {isCollapsed ? "\u25BE" : "\u25B4"}
                </span>
              </div>
              {isCollapsed ? (
                <>
                  <SkillRow name={topSkill![0]} entry={topSkill![1]} />
                  {entries.length > 1 && (
                    <div class="skill-group-more" onClick={() => toggle(stat)}>
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
        })}
      </div>
    </Panel>
  );
};
