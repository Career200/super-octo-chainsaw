import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";

import { STAT_LABELS, STAT_NAMES } from "@scripts/combat/types";
import type { SkillStat } from "@scripts/skills/catalog";
import { SKILL_CATALOG } from "@scripts/skills/catalog";
import {
  $allSkills,
  addSkill,
  isCustomSkill,
  removeSkill,
  updateSkill,
} from "@stores/skills";
import { $addingSkill, $selectedSkill, selectSkill } from "@stores/ui";

import { BottomBarItemShell } from "../common/bottombar/BottomBarItemShell";

const SKILL_STAT_OPTIONS: { value: SkillStat; label: string }[] = [
  ...STAT_NAMES.map((s) => ({ value: s as SkillStat, label: STAT_LABELS[s] })),
  { value: "special", label: "SPECIAL" },
];

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

interface SkillFormProps {
  disabled: boolean;
  name: string;
  onNameChange?: (v: string) => void;
  stat: SkillStat;
  onStatChange?: (v: SkillStat) => void;
  combat: boolean;
  onCombatChange?: (v: boolean) => void;
  description: string;
  onDescriptionChange?: (v: string) => void;
}

function SkillForm({
  disabled,
  name,
  onNameChange,
  stat,
  onStatChange,
  combat,
  onCombatChange,
  description,
  onDescriptionChange,
}: SkillFormProps) {
  return (
    <div class="skill-form">
      <div class="skill-form-fields">
        <label class="skill-form-field skill-form-name">
          <span class="skill-form-label">Name</span>
          <input
            type="text"
            class="input skill-form-input"
            value={name}
            disabled={disabled}
            onInput={
              onNameChange
                ? (e) => onNameChange((e.target as HTMLInputElement).value)
                : undefined
            }
            placeholder="Skill name"
            autoFocus={!disabled}
          />
        </label>
        <label class="skill-form-field skill-form-stat">
          <span class="skill-form-label">Stat</span>
          <select
            class="input skill-form-input"
            value={stat}
            disabled={disabled}
            onChange={
              onStatChange
                ? (e) =>
                    onStatChange(
                      (e.target as HTMLSelectElement).value as SkillStat,
                    )
                : undefined
            }
          >
            {SKILL_STAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label class="skill-form-field skill-form-combat">
          <span class="skill-form-label">Combat</span>
          <input
            type="checkbox"
            checked={combat}
            disabled={disabled}
            onChange={
              onCombatChange
                ? (e) => onCombatChange((e.target as HTMLInputElement).checked)
                : undefined
            }
          />
        </label>
      </div>
      <textarea
        class="input skill-form-description"
        value={description}
        disabled={!onDescriptionChange}
        onInput={
          onDescriptionChange
            ? (e) =>
                onDescriptionChange((e.target as HTMLTextAreaElement).value)
            : undefined
        }
        placeholder="No description"
      />
    </div>
  );
}

export const BottomBarSkills = ({ expanded, onToggle }: Props) => {
  const skillName = useStore($selectedSkill);
  const adding = useStore($addingSkill);
  const allSkills = useStore($allSkills);
  const entry = skillName ? allSkills[skillName] : null;

  // Add-mode form state
  const [newName, setNewName] = useState("");
  const [newStat, setNewStat] = useState<SkillStat>("ref");
  const [newCombat, setNewCombat] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  const isCustom = skillName ? isCustomSkill(skillName) : false;
  const catalogDef = skillName && !isCustom ? SKILL_CATALOG[skillName] : null;
  const description = catalogDef?.description ?? entry?.description ?? "";

  const handleAdd = (): string | null => {
    const trimmed = newName.trim();
    if (!trimmed) return "Name cannot be empty";
    if (
      addSkill(trimmed, newStat, newCombat, newDescription.trim() || undefined)
    ) {
      setNewName("");
      setNewStat("ref");
      setNewCombat(false);
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
          combat={newCombat}
          onCombatChange={setNewCombat}
          description={newDescription}
          onDescriptionChange={setNewDescription}
        />
      ) : entry ? (
        <SkillForm
          disabled
          name={skillName!}
          stat={entry.stat}
          combat={entry.combat}
          description={description}
          onDescriptionChange={
            isCustom
              ? (v) => updateSkill(skillName!, { description: v || undefined })
              : undefined
          }
        />
      ) : null}
    </BottomBarItemShell>
  );
};
