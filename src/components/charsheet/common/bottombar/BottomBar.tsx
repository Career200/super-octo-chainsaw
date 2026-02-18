import { useState, useRef } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  $spaTab,
  $addingSkill,
  $selectedSkill,
  $addingGear,
  $selectedGear,
} from "@stores/ui";
import { BottomBarSkills } from "../../dossier/BottomBarSkills";
import { BottomBarHistory } from "../../biomon/BottomBarHistory";
import { BottomBarEquipment } from "../../equipment/BottomBarEquipment";

export const BottomBar = () => {
  const tab = useStore($spaTab);
  const addingSkill = useStore($addingSkill);
  const selectedSkill = useStore($selectedSkill);
  const addingGear = useStore($addingGear);
  const selectedGear = useStore($selectedGear);
  const [expanded, setExpanded] = useState(false);

  // Collapse when switching tabs
  const tabRef = useRef(tab);
  if (tabRef.current !== tab) {
    tabRef.current = tab;
    if (expanded) setExpanded(false);
  }

  // --- Skills auto-expand ---
  const addingSkillRef = useRef(addingSkill);
  if (addingSkill && !addingSkillRef.current) {
    if (!expanded) setExpanded(true);
  }
  addingSkillRef.current = addingSkill;

  const selectedSkillRef = useRef(selectedSkill);
  if (selectedSkill && selectedSkill !== selectedSkillRef.current) {
    if (!expanded) setExpanded(true);
  }
  if (!selectedSkill && selectedSkillRef.current && !addingSkill) {
    if (expanded) setExpanded(false);
  }
  selectedSkillRef.current = selectedSkill;

  // --- Gear auto-expand ---
  const addingGearRef = useRef(addingGear);
  if (addingGear && !addingGearRef.current) {
    if (!expanded) setExpanded(true);
  }
  addingGearRef.current = addingGear;

  const selectedGearRef = useRef(selectedGear);
  if (selectedGear && selectedGear !== selectedGearRef.current) {
    if (!expanded) setExpanded(true);
  }
  if (!selectedGear && selectedGearRef.current && !addingGear) {
    if (expanded) setExpanded(false);
  }
  selectedGearRef.current = selectedGear;

  // Safety: collapse if current tab has no active content
  const hasContent =
    (tab === "dossier" && (selectedSkill || addingSkill)) ||
    (tab === "equipment" && (selectedGear || addingGear)) ||
    tab === "biomon"; // biomon always has history content
  if (expanded && !hasContent) {
    setExpanded(false);
  }

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
      {tab === "equipment" && (
        <BottomBarEquipment
          expanded={expanded}
          onToggle={() => setExpanded((e) => !e)}
        />
      )}
    </div>
  );
};
