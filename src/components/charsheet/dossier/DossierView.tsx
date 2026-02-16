import { useState } from "preact/hooks";
import { selectSkill } from "@stores/ui";
import { StatsSkillsPanel } from "./StatsSkillsPanel";
import { NotesPanel } from "./NotesPanel";

export const DossierView = () => {
  const [skillsExpanded, setSkillsExpanded] = useState(true);
  const [notesExpanded, setNotesExpanded] = useState(true);

  const toggleSkills = () => {
    const next = !skillsExpanded;
    setSkillsExpanded(next);
    if (!next) {
      // Collapsing skills → expand notes, deselect skill (collapses bottom bar)
      setNotesExpanded(true);
      selectSkill(null);
    }
  };

  const toggleNotes = () => {
    const next = !notesExpanded;
    setNotesExpanded(next);
    if (!next) {
      // Collapsing notes → expand skills (at least one always expanded)
      setSkillsExpanded(true);
    }
  };

  return (
    <div class="container">
      <StatsSkillsPanel expanded={skillsExpanded} onToggle={toggleSkills} />
      <NotesPanel expanded={notesExpanded} onToggle={toggleNotes} />
    </div>
  );
};
