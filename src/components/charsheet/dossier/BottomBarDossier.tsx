import { useStore } from "@nanostores/preact";

import { useFormState } from "@components/charsheet/shared";
import { STAT_LABELS, type StatName } from "@scripts/combat/types";
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
import { STAT_STORES } from "@stores/stats";
import {
  $addingSkill,
  $selectedSkill,
  $selectedStat,
  selectSkill,
} from "@stores/ui";

import { BottomBarItemShell } from "../common/bottombar/BottomBarItemShell";
import { BottomBarShell } from "../common/bottombar/BottomBarShell";

import { SkillDetail } from "./SkillDetail";
import { SkillForm } from "./SkillForm";
import { StatDetail } from "./StatDetail";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

function BottomBarStat({
  expanded,
  onToggle,
  statName,
}: Props & { statName: StatName }) {
  const values = useStore(STAT_STORES[statName]);
  const fullName = STAT_LABELS[statName];

  return (
    <BottomBarShell
      expanded={expanded}
      onToggle={onToggle}
      headerContent={<span class="bottom-bar-name">{fullName}</span>}
    >
      <StatDetail name={statName} values={values} />
    </BottomBarShell>
  );
}

function BottomBarSkill({ expanded, onToggle }: Props) {
  const skillName = useStore($selectedSkill);
  const adding = useStore($addingSkill);
  const allSkills = useStore($allSkills);
  const entry = skillName ? allSkills[skillName] : null;

  const {
    fields: f,
    setField,
    reset,
  } = useFormState({
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
      hintText="Select a stat or skill"
      adding={adding}
      onAdd={handleAdd}
      isCustom={isCustom}
      removeName={skillName ?? undefined}
      onRemove={handleRemove}
    >
      {adding ? (
        <SkillForm
          autoFocus
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
          commitOnBlur
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

export default function BottomBarDossier({ expanded, onToggle }: Props) {
  const statName = useStore($selectedStat);

  if (statName) {
    return (
      <BottomBarStat
        expanded={expanded}
        onToggle={onToggle}
        statName={statName}
      />
    );
  }

  return <BottomBarSkill expanded={expanded} onToggle={onToggle} />;
}
