import { useState, useRef } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  tabStore,
  $addingSkill,
  $selectedSkill,
  $addingGear,
  $selectedGear,
  $addingArmor,
  $selectedArmor,
} from "@stores/ui";
import { useAutoExpand } from "./useAutoExpand";
import { BottomBarSkills } from "../../dossier/BottomBarSkills";
import { BottomBarHistory } from "../../biomon/BottomBarHistory";
import { BottomBarEquipment } from "../../equipment/BottomBarEquipment";
import { BottomBarArmor } from "../../equipment/BottomBarArmor";

export const BottomBar = () => {
  const tab = useStore(tabStore("spa-tab", "biomon"));
  const addingSkill = useStore($addingSkill);
  const selectedSkill = useStore($selectedSkill);
  const addingGear = useStore($addingGear);
  const selectedGear = useStore($selectedGear);
  const addingArmor = useStore($addingArmor);
  const selectedArmor = useStore($selectedArmor);
  const equipSubTab = useStore(tabStore("equipment-sub-tab", "gear"));
  const [expanded, setExpanded] = useState(false);

  // Collapse when switching tabs
  const tabRef = useRef(tab);
  if (tabRef.current !== tab) {
    tabRef.current = tab;
    if (expanded) setExpanded(false);
  }

  useAutoExpand(addingSkill, selectedSkill, expanded, setExpanded);
  useAutoExpand(addingGear, selectedGear, expanded, setExpanded);
  useAutoExpand(addingArmor, selectedArmor, expanded, setExpanded);

  // Safety: collapse if current tab has no active content
  const hasContent =
    (tab === "dossier" && (selectedSkill || addingSkill)) ||
    (tab === "equipment" &&
      ((equipSubTab === "gear" && (selectedGear || addingGear)) ||
        (equipSubTab === "armor" && (!!selectedArmor || addingArmor)))) ||
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
      if (addingArmor) $addingArmor.set(false);
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
      {tab === "equipment" && equipSubTab === "gear" && (
        <BottomBarEquipment expanded={expanded} onToggle={toggle} />
      )}
      {tab === "equipment" && equipSubTab === "armor" && (
        <BottomBarArmor expanded={expanded} onToggle={toggle} />
      )}
    </div>
  );
};
