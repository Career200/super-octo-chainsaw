import { useStore } from "@nanostores/preact";

import { useFormState } from "@components/charsheet/shared";
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
  const { fields: f, setField, reset } = useFormState({
    name: "",
    stat: "ref" as SkillStat,
    melee: false,
    martialArt: false,
    keyAttacks: {} as Partial<Record<Maneuver, number>>,
    diffMod: 1,
    description: "",
  });

  const isCustom = skillName ? isCustomSkill(skillName) : false;
  const catalogDef = skillName && !isCustom ? SKILL_CATALOG[skillName] : null;
  const description = catalogDef?.description ?? entry?.description ?? "";
  const diffMod = catalogDef?.diffMod ?? entry?.diffMod ?? 1;
  const martialArt = catalogDef?.martialArt ?? entry?.martialArt ?? false;
  const keyAttacks = catalogDef?.keyAttacks ?? entry?.keyAttacks ?? {};

  const handleAdd = (): string | null => {
    const trimmed = f.name.trim();
    if (!trimmed) return "Name cannot be empty";
    if (
      addSkill(trimmed, f.stat, f.melee, {
        description: f.description.trim() || undefined,
        martialArt: f.martialArt || undefined,
        keyAttacks:
          f.martialArt && Object.keys(f.keyAttacks).length > 0
            ? f.keyAttacks
            : undefined,
        diffMod: f.diffMod !== 1 ? f.diffMod : undefined,
      })
    ) {
      reset();
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
          name={f.name}
          onNameChange={(v) => setField("name", v)}
          stat={f.stat}
          onStatChange={(v) => setField("stat", v)}
          diffMod={f.diffMod}
          onDiffModChange={(v) => setField("diffMod", v)}
          melee={f.melee}
          onMeleeChange={(v) => setField("melee", v)}
          martialArt={f.martialArt}
          onMartialArtChange={(v) => setField("martialArt", v)}
          keyAttacks={f.keyAttacks}
          onKeyAttacksChange={(v) => setField("keyAttacks", v)}
          description={f.description}
          onDescriptionChange={(v) => setField("description", v)}
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
