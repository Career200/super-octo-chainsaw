import { useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $skillTotal } from "@stores/skills";
import { Panel } from "../shared/Panel";
import { StatsPanel } from "../biomon/StatsPanel";
import { SkillsList } from "./SkillsPanel";

type SkillFilter = "all" | "my";

export const StatsSkillsPanel = () => {
  const total = useStore($skillTotal);
  const [filter, setFilter] = useState<SkillFilter>("all");

  return (
    <Panel
      id="stats-skills-panel"
      title={
        <span class="stats-skills-heading">
          <span>Stats</span>
          <span class="stats-skills-heading-skills">Skills</span>
        </span>
      }
      headerActions={
        <span class="tab-strip" onClick={(e) => e.stopPropagation()}>
          <button
            class={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            class={filter === "my" ? "active" : ""}
            onClick={() => setFilter("my")}
          >
            My {total}
          </button>
        </span>
      }
      defaultExpanded
    >
      <div class="stats-skills-stats">
        <StatsPanel />
      </div>
      <div class="stats-skills-skills">
        <SkillsList filter={filter} />
      </div>
    </Panel>
  );
};
