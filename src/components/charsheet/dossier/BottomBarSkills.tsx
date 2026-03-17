import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";

import type { Maneuver, SkillStat } from "@scripts/skills/catalog";
import { SKILL_CATALOG } from "@scripts/skills/catalog";
import {
  $allSkills,
  addSkill,
  isCustomSkill,
  removeSkill,
  renameSkill,
  updateSkill,
} from "@stores/skills";
import { $addingSkill, $selectedSkill, selectSkill } from "@stores/ui";

import { BottomBarItemShell } from "../common/bottombar/BottomBarItemShell";

import { SkillDetail } from "./SkillDetail";
import { SkillForm } from "./SkillForm";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export default function BottomBarSkills({ expanded, onToggle }: Props) {
  const skillName = useStore($selectedSkill);
  const adding = useStore($addingSkill);
  const allSkills = useStore($allSkills);
  const entry = skillName ? allSkills[skillName] : null;

  // Add-mode form state
  const [newName, setNewName] = useState("");
  const [newStat, setNewStat] = useState<SkillStat>("ref");
  const [newMelee, setNewMelee] = useState(false);
  const [newMartialArt, setNewMartialArt] = useState(false);
  const [newKeyAttacks, setNewKeyAttacks] = useState<
    Partial<Record<Maneuver, number>>
  >({});
  const [newDiffMod, setNewDiffMod] = useState(1);
  const [newDescription, setNewDescription] = useState("");

  const isCustom = skillName ? isCustomSkill(skillName) : false;
  const catalogDef = skillName && !isCustom ? SKILL_CATALOG[skillName] : null;
  const description = catalogDef?.description ?? entry?.description ?? "";
  const diffMod = catalogDef?.diffMod ?? entry?.diffMod ?? 1;
  const martialArt = catalogDef?.martialArt ?? entry?.martialArt ?? false;
  const keyAttacks = catalogDef?.keyAttacks ?? entry?.keyAttacks ?? {};

  const handleAdd = (): string | null => {
    const trimmed = newName.trim();
    if (!trimmed) return "Name cannot be empty";
    if (
      addSkill(trimmed, newStat, newMelee, {
        description: newDescription.trim() || undefined,
        martialArt: newMartialArt || undefined,
        keyAttacks:
          newMartialArt && Object.keys(newKeyAttacks).length > 0
            ? newKeyAttacks
            : undefined,
        diffMod: newDiffMod !== 1 ? newDiffMod : undefined,
      })
    ) {
      setNewName("");
      setNewStat("ref");
      setNewMelee(false);
      setNewMartialArt(false);
      setNewKeyAttacks({});
      setNewDiffMod(1);
      setNewDescription("");
      selectSkill(trimmed);
      return null;
    }
    return `"${trimmed}" already exists`;
  };

  const handleRemove = () => {
    removeSkill(skillName!);
    selectSkill(null);
  };

  return (
    <BottomBarItemShell
      expanded={expanded}
      onToggle={onToggle}
      headerLabel={adding ? "New custom skill" : (skillName ?? "")}
      hasContent={!!(entry && skillName) || adding}
      hintText="Select a skill"
      adding={adding}
      onAdd={handleAdd}
      isCustom={isCustom}
      removeName={skillName ?? undefined}
      onRemove={handleRemove}
    >
      {adding ? (
        <SkillForm
          disabled={false}
          name={newName}
          onNameChange={setNewName}
          stat={newStat}
          onStatChange={setNewStat}
          diffMod={newDiffMod}
          onDiffModChange={setNewDiffMod}
          melee={newMelee}
          onMeleeChange={setNewMelee}
          martialArt={newMartialArt}
          onMartialArtChange={setNewMartialArt}
          keyAttacks={newKeyAttacks}
          onKeyAttacksChange={setNewKeyAttacks}
          description={newDescription}
          onDescriptionChange={setNewDescription}
        />
      ) : entry && isCustom ? (
        <SkillForm
          disabled
          name={skillName!}
          onNameChange={(v) => {
            if (renameSkill(skillName!, v)) selectSkill(v);
          }}
          stat={entry.stat}
          diffMod={diffMod}
          onDiffModChange={(v) => updateSkill(skillName!, { diffMod: v })}
          melee={entry.melee}
          martialArt={martialArt}
          keyAttacks={keyAttacks}
          onKeyAttacksChange={(v) => updateSkill(skillName!, { keyAttacks: v })}
          description={description}
          onDescriptionChange={(v) =>
            updateSkill(skillName!, { description: v || undefined })
          }
        />
      ) : entry ? (
        <SkillDetail
          stat={entry.stat}
          diffMod={diffMod}
          melee={entry.melee}
          martialArt={martialArt}
          keyAttacks={keyAttacks}
          description={description}
        />
      ) : null}
    </BottomBarItemShell>
  );
}
