import { selectSkill } from "@stores/ui";
import { TwoPanelView } from "../shared/TwoPanelView";
import { StatsSkillsPanel } from "./StatsSkillsPanel";
import { NotesPanel } from "./NotesPanel";

export const DossierView = () => (
  <TwoPanelView
    renderFirst={(expanded, onToggle) => (
      <StatsSkillsPanel expanded={expanded} onToggle={onToggle} />
    )}
    renderSecond={(expanded, onToggle) => (
      <NotesPanel expanded={expanded} onToggle={onToggle} />
    )}
    onFirstCollapse={() => selectSkill(null)}
  />
);
