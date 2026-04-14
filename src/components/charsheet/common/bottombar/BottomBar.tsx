import { useStore } from "@nanostores/preact";
import { Suspense } from "preact/compat";
import { useRef, useState } from "preact/hooks";

import {
  $addingArmor,
  $addingGear,
  $addingSkill,
  $selectedArmor,
  $selectedCyber,
  $selectedGear,
  $selectedSkill,
  $selectedStat,
  $weaponAmmoFocus,
  tabStore,
} from "@stores/ui";

import { tracedLazy } from "../../tracedLazy";

import { useAutoExpand } from "./useAutoExpand";

const BottomBarHistory = tracedLazy(
  "BottomBarHistory",
  () => import("../../combat/BottomBarHistory"),
);
const BottomBarDossier = tracedLazy(
  "BottomBarDossier",
  () => import("../../dossier/BottomBarDossier"),
);
const BottomBarArmor = tracedLazy(
  "BottomBarArmor",
  () => import("../../equipment/armor/BottomBarArmor"),
);
const BottomBarEquipment = tracedLazy(
  "BottomBarEquipment",
  () => import("../../equipment/gear/BottomBarEquipment"),
);
const BottomBarWeapon = tracedLazy(
  "BottomBarWeapon",
  () => import("../../equipment/weapons/BottomBarWeapon"),
);
const BottomBarAmmo = tracedLazy(
  "BottomBarAmmo",
  () => import("../../equipment/weapons/BottomBarAmmo"),
);
const BottomBarCyber = tracedLazy(
  "BottomBarCyber",
  () => import("../../equipment/cyber/BottomBarCyber"),
);

export const BottomBar = () => {
  const tab = useStore(tabStore("spa-tab", "combat"));
  const selectedStat = useStore($selectedStat);
  const addingSkill = useStore($addingSkill);
  const selectedSkill = useStore($selectedSkill);
  const addingGear = useStore($addingGear);
  const selectedGear = useStore($selectedGear);
  const addingArmor = useStore($addingArmor);
  const selectedArmor = useStore($selectedArmor);
  const selectedCyber = useStore($selectedCyber);
  const weaponAmmoFocus = useStore($weaponAmmoFocus);
  const equipSubTab = useStore(tabStore("equipment-sub-tab", "gear"));
  const [expanded, setExpanded] = useState(false);

  // Collapse when switching tabs
  const tabRef = useRef(tab);
  if (tabRef.current !== tab) {
    tabRef.current = tab;
    if (expanded) setExpanded(false);
  }

  // Stat + skill share the dossier bottom bar — combine into one selection
  // so deselecting one while selecting the other doesn't collapse the bar.
  const dossierSelection = selectedStat ?? selectedSkill;
  useAutoExpand(addingSkill, dossierSelection, expanded, setExpanded);
  useAutoExpand(addingGear, selectedGear, expanded, setExpanded);
  useAutoExpand(addingArmor, selectedArmor, expanded, setExpanded);
  useAutoExpand(false, selectedCyber, expanded, setExpanded);
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
    (tab === "dossier" && (selectedStat || selectedSkill || addingSkill)) ||
    (tab === "equipment" &&
      ((equipSubTab === "gear" && (selectedGear || addingGear)) ||
        (equipSubTab === "weapons" && hasWeaponAmmo) ||
        (equipSubTab === "armor" && (!!selectedArmor || addingArmor)) ||
        (equipSubTab === "cyber" && !!selectedCyber))) ||
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
          <BottomBarDossier expanded={expanded} onToggle={toggle} />
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
        {tab === "equipment" && equipSubTab === "cyber" && (
          <BottomBarCyber expanded={expanded} onToggle={toggle} />
        )}
      </Suspense>
    </div>
  );
};
