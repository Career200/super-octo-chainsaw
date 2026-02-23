import { useStore } from "@nanostores/preact";
import { lazy, Suspense } from "preact/compat";
import { useRef, useState } from "preact/hooks";

import {
  $addingArmor,
  $addingGear,
  $addingSkill,
  $addingWeapon,
  $selectedArmor,
  $selectedGear,
  $selectedSkill,
  $selectedWeapon,
  tabStore,
} from "@stores/ui";

import { useAutoExpand } from "./useAutoExpand";

const BottomBarHistory = lazy(() =>
  import("../../combat/BottomBarHistory").then((m) => ({
    default: m.BottomBarHistory,
  })),
);
const BottomBarSkills = lazy(() =>
  import("../../dossier/BottomBarSkills").then((m) => ({
    default: m.BottomBarSkills,
  })),
);
const BottomBarArmor = lazy(() =>
  import("../../equipment/BottomBarArmor").then((m) => ({
    default: m.BottomBarArmor,
  })),
);
const BottomBarEquipment = lazy(() =>
  import("../../equipment/BottomBarEquipment").then((m) => ({
    default: m.BottomBarEquipment,
  })),
);
const BottomBarWeapon = lazy(() =>
  import("../../equipment/BottomBarWeapon").then((m) => ({
    default: m.BottomBarWeapon,
  })),
);

export const BottomBar = () => {
  const tab = useStore(tabStore("spa-tab", "combat"));
  const addingSkill = useStore($addingSkill);
  const selectedSkill = useStore($selectedSkill);
  const addingGear = useStore($addingGear);
  const selectedGear = useStore($selectedGear);
  const addingArmor = useStore($addingArmor);
  const selectedArmor = useStore($selectedArmor);
  const addingWeapon = useStore($addingWeapon);
  const selectedWeapon = useStore($selectedWeapon);
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
  useAutoExpand(addingWeapon, selectedWeapon, expanded, setExpanded);

  // Safety: collapse if current tab has no active content
  const hasContent =
    (tab === "dossier" && (selectedSkill || addingSkill)) ||
    (tab === "equipment" &&
      ((equipSubTab === "gear" && (selectedGear || addingGear)) ||
        (equipSubTab === "weapons" && (!!selectedWeapon || addingWeapon)) ||
        (equipSubTab === "armor" && (!!selectedArmor || addingArmor)))) ||
    tab === "combat"; // combat always has history content
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
      if (addingWeapon) $addingWeapon.set(false);
    } else {
      setExpanded(true);
    }
  };

  return (
    <div class={`bottom-bar${expanded ? " expanded" : ""}`}>
      <Suspense fallback={null}>
        {tab === "dossier" && (
          <BottomBarSkills expanded={expanded} onToggle={toggle} />
        )}
        {tab === "combat" && (
          <BottomBarHistory expanded={expanded} onToggle={toggle} />
        )}
        {tab === "equipment" && equipSubTab === "gear" && (
          <BottomBarEquipment expanded={expanded} onToggle={toggle} />
        )}
        {tab === "equipment" && equipSubTab === "weapons" && (
          <BottomBarWeapon expanded={expanded} onToggle={toggle} />
        )}
        {tab === "equipment" && equipSubTab === "armor" && (
          <BottomBarArmor expanded={expanded} onToggle={toggle} />
        )}
      </Suspense>
    </div>
  );
};
