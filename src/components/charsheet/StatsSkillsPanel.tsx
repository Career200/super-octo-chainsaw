import { useStore } from "@nanostores/preact";
import { $skillTotal } from "@stores/skills";
import { Panel } from "@components/shared/Panel";
import { StatsPanel } from "../biomon/StatsPanel";
import { SkillsList } from "./SkillsPanel";

export const StatsSkillsPanel = () => {
  const total = useStore($skillTotal);

  return (
    <Panel
      id="stats-skills-panel"
      /*
      idea for title style - do the padding-right: 45px; on the first child as is, but drop padding to space-8 if collapsed
      looks better but kinda bulky to implement
      */
      title={
        <span class="stats-skills-heading">
          <span>Stats</span>
          <span>
            Skills <span class="skill-total">{total}</span>
          </span>
        </span>
      }
      defaultExpanded
    >
      <div class="stats-skills-stats">
        <StatsPanel />
      </div>
      <div class="stats-skills-skills">
        <SkillsList />
      </div>
    </Panel>
  );
};
