import { selectSkill } from "@stores/ui";

import { TwoPanelView } from "../shared/TwoPanelView";

import { NotesPanel } from "./NotesPanel";
import { StatsSkillsPanel } from "./StatsSkillsPanel";

export default function DossierView() {
  return (
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
}
