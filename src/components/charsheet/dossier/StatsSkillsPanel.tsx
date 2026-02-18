import { useStore } from "@nanostores/preact";
import { $mySkillsCount } from "@stores/skills";
import { tabStore } from "@stores/ui";
import { Panel } from "../shared/Panel";
import { TabStrip } from "../shared/TabStrip";
import { StatsPanel } from "../biomon/StatsPanel";
import { SkillsList } from "./SkillsPanel";
import type { SkillFilter } from "./SkillsPanel";

export const StatsSkillsPanel = ({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) => {
  const myCount = useStore($mySkillsCount);
  const filter = useStore(tabStore("skills-filter", "default"));

  return (
    <Panel
      id="stats-skills-panel"
      title="Stats / Skills"
      expanded={expanded}
      onToggle={onToggle}
      headerActions={
        <TabStrip
          persist="skills-filter"
          tabs={[
            { id: "default", label: "Default" },
            { id: "custom", label: "Custom" },
            { id: "my", label: `My${myCount > 0 ? ` ${myCount}` : ""}` },
          ]}
        />
      }
    >
      <div class="stats-skills-stats">
        <StatsPanel />
      </div>
      <div class="stats-skills-skills">
        <SkillsList filter={filter as SkillFilter} />
      </div>
    </Panel>
  );
};
