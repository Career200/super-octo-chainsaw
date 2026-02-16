import { useState, useRef } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $spaTab, $addingSkill, $selectedSkill } from "@stores/ui";
import { BottomBarSkills } from "../../dossier/BottomBarSkills";
import { BottomBarHistory } from "../../biomon/BottomBarHistory";

export const BottomBar = () => {
  const tab = useStore($spaTab);
  const adding = useStore($addingSkill);
  const selected = useStore($selectedSkill);
  const [expanded, setExpanded] = useState(false);

  // Collapse when switching tabs
  const tabRef = useRef(tab);
  if (tabRef.current !== tab) {
    tabRef.current = tab;
    if (expanded) setExpanded(false);
  }

  // Auto-expand when entering add mode
  const addingRef = useRef(adding);
  if (adding && !addingRef.current) {
    if (!expanded) setExpanded(true);
  }
  addingRef.current = adding;

  // Auto-expand when selecting a skill
  const selectedRef = useRef(selected);
  if (selected && selected !== selectedRef.current) {
    if (!expanded) setExpanded(true);
  }
  // Collapse when deselecting (and not adding)
  if (!selected && selectedRef.current && !adding) {
    if (expanded) setExpanded(false);
  }
  selectedRef.current = selected;

  return (
    <div class={`bottom-bar${expanded ? " expanded" : ""}`}>
      {tab === "dossier" && (
        <BottomBarSkills
          expanded={expanded}
          onToggle={() => setExpanded((e) => !e)}
        />
      )}
      {tab === "biomon" && (
        <BottomBarHistory
          expanded={expanded}
          onToggle={() => setExpanded((e) => !e)}
        />
      )}
    </div>
  );
};
