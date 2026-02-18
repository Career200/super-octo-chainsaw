import { useState, useRef } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  tabStore,
  $addingSkill,
  $selectedSkill,
  $addingGear,
  $selectedGear,
} from "@stores/ui";
import { useAutoExpand } from "./useAutoExpand";
import { BottomBarSkills } from "../../dossier/BottomBarSkills";
import { BottomBarHistory } from "../../biomon/BottomBarHistory";
import { BottomBarEquipment } from "../../equipment/BottomBarEquipment";

export const BottomBar = () => {
  const tab = useStore(tabStore("spa-tab", "biomon"));
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

  useAutoExpand(addingSkill, selectedSkill, expanded, setExpanded);
  useAutoExpand(addingGear, selectedGear, expanded, setExpanded);

  // Safety: collapse if current tab has no active content
  const hasContent =
    (tab === "dossier" && (selectedSkill || addingSkill)) ||
    (tab === "equipment" && (selectedGear || addingGear)) ||
    tab === "biomon"; // biomon always has history content
  if (expanded && !hasContent) {
    setExpanded(false);
  }

  const toggle = () => {
    if (expanded) {
      // Collapsing: dismiss "adding" mode so re-clicking "Add"
      // triggers a fresh false→true transition in useAutoExpand
      setExpanded(false);
      if (addingSkill) $addingSkill.set(false);
      if (addingGear) $addingGear.set(false);
    } else {
      setExpanded(true);
    }
  };

  return (
    <div class={`bottom-bar${expanded ? " expanded" : ""}`}>
      {tab === "dossier" && (
        <BottomBarSkills expanded={expanded} onToggle={toggle} />
      )}
      {tab === "biomon" && (
        <BottomBarHistory expanded={expanded} onToggle={toggle} />
      )}
      {tab === "equipment" && (
        <BottomBarEquipment expanded={expanded} onToggle={toggle} />
      )}
    </div>
  );
};
