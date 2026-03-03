import { useStore } from "@nanostores/preact";
import { useRef, useState } from "preact/hooks";

import { STAT_LABELS, STAT_NAMES } from "@scripts/combat/types";
import type { Maneuver, SkillStat } from "@scripts/skills/catalog";
import {
  MANEUVER_LABELS,
  MANEUVER_NAMES,
  SKILL_CATALOG,
} from "@scripts/skills/catalog";
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

const SKILL_STAT_OPTIONS: { value: SkillStat; label: string }[] = [
  ...STAT_NAMES.map((s) => ({ value: s as SkillStat, label: STAT_LABELS[s] })),
  { value: "special", label: "SPECIAL" },
];

const KEY_ATTACK_OPTIONS = [
  { value: "0", label: "\u2014" },
  { value: "1", label: "+1" },
  { value: "2", label: "+2" },
  { value: "3", label: "+3" },
  { value: "4", label: "+4" },
  { value: "5", label: "+5" },
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
  diffMod: number;
  onDiffModChange?: (v: number) => void;
  melee: boolean;
  onMeleeChange?: (v: boolean) => void;
  martialArt: boolean;
  onMartialArtChange?: (v: boolean) => void;
  keyAttacks: Partial<Record<Maneuver, number>>;
  onKeyAttacksChange?: (v: Partial<Record<Maneuver, number>>) => void;
  description: string;
  onDescriptionChange?: (v: string) => void;
}

function SkillForm({
  disabled,
  name,
  onNameChange,
  stat,
  onStatChange,
  diffMod,
  onDiffModChange,
  melee,
  onMeleeChange,
  martialArt,
  onMartialArtChange,
  keyAttacks,
  onKeyAttacksChange,
  description,
  onDescriptionChange,
}: SkillFormProps) {
  // Rename mode: local state + commit on blur/Enter
  const isRename = disabled && !!onNameChange;
  const [localName, setLocalName] = useState(name);
  const prevName = useRef(name);
  if (name !== prevName.current) {
    prevName.current = name;
    setLocalName(name);
  }

  const commitName = () => {
    const trimmed = localName.trim();
    if (trimmed && trimmed !== name) onNameChange!(trimmed);
    else setLocalName(name);
  };

  return (
    <div class="skill-form">
      <div class="skill-form-fields">
        {onNameChange && (
          <label class="skill-form-field skill-form-name">
            <span class="skill-form-label">Name</span>
            <input
              type="text"
              class="input skill-form-input"
              value={isRename ? localName : name}
              onInput={(e) => {
                const v = (e.target as HTMLInputElement).value;
                if (isRename) setLocalName(v);
                else onNameChange(v);
              }}
              onBlur={isRename ? commitName : undefined}
              onKeyDown={
                isRename
                  ? (e) => {
                      if (e.key === "Enter")
                        (e.target as HTMLInputElement).blur();
                    }
                  : undefined
              }
              placeholder="Skill name"
              autoFocus={!disabled}
            />
          </label>
        )}
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
        <label class="skill-form-field skill-form-diff">
          <span class="skill-form-label">Diff</span>
          <input
            type="number"
            class="input skill-form-input"
            value={diffMod}
            disabled={!onDiffModChange}
            min={1}
            max={10}
            onInput={
              onDiffModChange
                ? (e) => {
                    const v = parseInt(
                      (e.target as HTMLInputElement).value,
                      10,
                    );
                    if (v >= 1 && v <= 10) onDiffModChange(v);
                  }
                : undefined
            }
          />
        </label>
        <label class="skill-form-field skill-form-combat">
          <span class="skill-form-label">Melee</span>
          <input
            type="checkbox"
            checked={melee}
            disabled={disabled}
            onChange={
              onMeleeChange
                ? (e) => onMeleeChange((e.target as HTMLInputElement).checked)
                : undefined
            }
          />
        </label>
        <label class="skill-form-field skill-form-combat">
          <span class="skill-form-label">MA</span>
          <input
            type="checkbox"
            checked={martialArt}
            disabled={disabled}
            onChange={
              onMartialArtChange
                ? (e) =>
                    onMartialArtChange((e.target as HTMLInputElement).checked)
                : undefined
            }
          />
        </label>
      </div>
      {martialArt && (
        <div class="skill-form-key-attacks">
          {MANEUVER_NAMES.map((m) => (
            <label key={m} class="skill-form-maneuver">
              <span class="skill-form-maneuver-label">
                {MANEUVER_LABELS[m]}
              </span>
              <select
                class="input skill-form-maneuver-input"
                value={String(keyAttacks[m] ?? 0)}
                disabled={!onKeyAttacksChange}
                onChange={
                  onKeyAttacksChange
                    ? (e) => {
                        const v = parseInt(
                          (e.target as HTMLSelectElement).value,
                          10,
                        );
                        const next = { ...keyAttacks };
                        if (v > 0) {
                          next[m] = v;
                        } else {
                          delete next[m];
                        }
                        onKeyAttacksChange(next);
                      }
                    : undefined
                }
              >
                {KEY_ATTACK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
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
      ) : entry ? (
        <SkillForm
          disabled
          name={skillName!}
          onNameChange={
            isCustom
              ? (v) => {
                  if (renameSkill(skillName!, v)) selectSkill(v);
                }
              : undefined
          }
          stat={entry.stat}
          diffMod={diffMod}
          onDiffModChange={
            isCustom
              ? (v) => updateSkill(skillName!, { diffMod: v })
              : undefined
          }
          melee={entry.melee}
          martialArt={martialArt}
          keyAttacks={keyAttacks}
          onKeyAttacksChange={
            isCustom
              ? (v) => updateSkill(skillName!, { keyAttacks: v })
              : undefined
          }
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
}
