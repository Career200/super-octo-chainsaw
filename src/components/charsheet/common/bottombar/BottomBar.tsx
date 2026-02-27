import { useStore } from "@nanostores/preact";
import { lazy, Suspense } from "preact/compat";
import { useRef, useState } from "preact/hooks";

import {
  $addingArmor,
  $addingGear,
  $addingSkill,
  $selectedArmor,
  $selectedGear,
  $selectedSkill,
  $weaponAmmoFocus,
  tabStore,
} from "@stores/ui";

import { useAutoExpand } from "./useAutoExpand";

const BottomBarHistory = lazy(() => import("../../combat/BottomBarHistory"));
const BottomBarSkills = lazy(() => import("../../dossier/BottomBarSkills"));
const BottomBarArmor = lazy(() => import("../../equipment/BottomBarArmor"));
const BottomBarEquipment = lazy(
  () => import("../../equipment/BottomBarEquipment"),
);
const BottomBarWeapon = lazy(() => import("../../equipment/BottomBarWeapon"));
const BottomBarAmmo = lazy(() => import("../../equipment/BottomBarAmmo"));

export const BottomBar = () => {
  const tab = useStore(tabStore("spa-tab", "combat"));
  const addingSkill = useStore($addingSkill);
  const selectedSkill = useStore($selectedSkill);
  const addingGear = useStore($addingGear);
  const selectedGear = useStore($selectedGear);
  const addingArmor = useStore($addingArmor);
  const selectedArmor = useStore($selectedArmor);
  const weaponAmmoFocus = useStore($weaponAmmoFocus);
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
  const hasWeaponAmmo = weaponAmmoFocus !== null;
  const isAddingWeaponAmmo =
    weaponAmmoFocus?.kind === "adding-weapon" ||
    weaponAmmoFocus?.kind === "adding-ammo";
  const hasWeaponAmmoSelection =
    weaponAmmoFocus?.kind === "weapon" || weaponAmmoFocus?.kind === "ammo";
  useAutoExpand(
    isAddingWeaponAmmo,
    hasWeaponAmmoSelection ? "yes" : null,
    expanded,
    setExpanded,
  );

  // Safety: collapse if current tab has no active content
  const hasContent =
    (tab === "dossier" && (selectedSkill || addingSkill)) ||
    (tab === "equipment" &&
      ((equipSubTab === "gear" && (selectedGear || addingGear)) ||
        (equipSubTab === "weapons" && hasWeaponAmmo) ||
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
      if (isAddingWeaponAmmo) $weaponAmmoFocus.set(null);
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
        {tab === "equipment" &&
          equipSubTab === "weapons" &&
          (weaponAmmoFocus?.kind === "ammo" ||
          weaponAmmoFocus?.kind === "adding-ammo" ? (
            <BottomBarAmmo expanded={expanded} onToggle={toggle} />
          ) : (
            <BottomBarWeapon expanded={expanded} onToggle={toggle} />
          ))}
        {tab === "equipment" && equipSubTab === "armor" && (
          <BottomBarArmor expanded={expanded} onToggle={toggle} />
        )}
      </Suspense>
    </div>
  );
};
