import { useStore } from "@nanostores/preact";
import { STAT_LABELS } from "@scripts/biomon/types";
import type { SkillStat } from "@scripts/skills/catalog";
import { $skillsByStat, setSkillLevel } from "@stores/skills";
import type { SkillEntry } from "@stores/skills";

const STAT_GROUP_ORDER: SkillStat[] = [
  "special",
  "int",
  "ref",
  "tech",
  "cl",
  "emp",
  "att",
  "bt",
  "ma",
  "lk",
];

const GROUP_LABELS: Record<SkillStat, string> = {
  ...STAT_LABELS,
  special: "SPECIAL",
};

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

  return (
    <div class="skills-panel">
      {STAT_GROUP_ORDER.map((stat) => {
        const entries = grouped[stat];
        if (!entries || entries.length === 0) return null;
        return (
          <div class="skill-group" key={stat}>
            <div class="skill-group-header">{GROUP_LABELS[stat]}</div>
            {entries.map(([name, entry]) => (
              <SkillRow key={name} name={name} entry={entry} />
            ))}
          </div>
        );
      })}
    </div>
  );
};
