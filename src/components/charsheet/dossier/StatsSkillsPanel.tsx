import { useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $mySkillsCount } from "@stores/skills";
import { Panel } from "../shared/Panel";
import { StatsPanel } from "../biomon/StatsPanel";
import { SkillsList } from "./SkillsPanel";

export type SkillFilter = "default" | "custom" | "my";

export const StatsSkillsPanel = ({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) => {
  const myCount = useStore($mySkillsCount);
  const [filter, setFilter] = useState<SkillFilter>("default");

  return (
    <Panel
      id="stats-skills-panel"
      title="Stats / Skills"
      expanded={expanded}
      onToggle={onToggle}
      headerActions={
        <span class="tab-strip" onClick={(e) => e.stopPropagation()}>
          <button
            class={filter === "default" ? "active" : ""}
            onClick={() => setFilter("default")}
          >
            Default
          </button>
          <button
            class={filter === "custom" ? "active" : ""}
            onClick={() => setFilter("custom")}
          >
            Custom
          </button>
          <button
            class={filter === "my" ? "active" : ""}
            onClick={() => setFilter("my")}
          >
            My {myCount > 0 && myCount}
          </button>
        </span>
      }
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
