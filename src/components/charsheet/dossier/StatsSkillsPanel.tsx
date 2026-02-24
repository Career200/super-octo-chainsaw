import { useStore } from "@nanostores/preact";

import { $mySkillsCount } from "@stores/skills";
import { tabStore } from "@stores/ui";

import { StatsPanel } from "../combat/StatsPanel";
import { HelpPopover } from "../shared/HelpPopover";
import { Panel } from "../shared/Panel";
import { TabStrip } from "../shared/TabStrip";

import { StatsSkillsHelpContent } from "./help/StatsSkillsHelpContent";
import type { SkillFilter } from "./SkillsPanel";
import { SkillsList } from "./SkillsPanel";

export const StatsSkillsPanel = ({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) => {
  const myCount = useStore($mySkillsCount);
  const filter = useStore(tabStore("skills-filter", "catalog"));

  return (
    <Panel
      id="stats-skills-panel"
      title={
        <>
          Stats / Skills{" "}
          <HelpPopover
            id="stats-skills-help"
            content={<StatsSkillsHelpContent />}
          />
        </>
      }
      expanded={expanded}
      onToggle={onToggle}
      headerActions={
        <TabStrip
          persist="skills-filter"
          tabs={[
            { id: "catalog", label: "Catalog" },
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
