import { useState, useRef } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  $selectedSkill,
  $addingSkill,
  selectSkill,
} from "@stores/ui";
import { $allSkills, addSkill, removeSkill, isCustomSkill } from "@stores/skills";
import type { SkillStat } from "@scripts/skills/catalog";
import { SKILL_CATALOG } from "@scripts/skills/catalog";
import { STAT_LABELS, STAT_NAMES } from "@scripts/biomon/types";
import { Chevron } from "../shared/Chevron";
import { ConfirmPopover } from "../shared/ConfirmPopover";

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
                ? (e) =>
                    onCombatChange((e.target as HTMLInputElement).checked)
                : undefined
            }
          />
        </label>
      </div>
      <textarea
        class="input skill-form-description"
        value={description}
        disabled
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

  // Remove confirmation
  const removeBtnRef = useRef<HTMLButtonElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isCustom = skillName ? isCustomSkill(skillName) : false;
  const catalogDef = skillName && !isCustom ? SKILL_CATALOG[skillName] : null;
  const description = catalogDef?.description ?? "";

  const hasContent = !!(entry && skillName) || adding;
  const headerLabel = adding
    ? "New custom skill"
    : skillName ?? "";

  if (!hasContent) {
    return (
      <div class="bottom-bar-row">
        <span class="bottom-bar-hint">Select a skill</span>
      </div>
    );
  }

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (addSkill(trimmed, newStat, newCombat)) {
      setNewName("");
      setNewStat("ref");
      setNewCombat(false);
      selectSkill(trimmed);
    }
  };

  const handleRemove = () => {
    removeSkill(skillName!);
    selectSkill(null);
  };

  return (
    <>
      <div class="bottom-bar-row expandable" onClick={onToggle}>
        <div class="bottom-bar-content">
          <span class="bottom-bar-name">{headerLabel}</span>
        </div>
        <div class="bottom-bar-actions">
          {adding && (
            <button
              class="skill-bar-action"
              onClick={(e) => {
                e.stopPropagation();
                handleAdd();
              }}
            >
              Add
            </button>
          )}
          {isCustom && !adding && (
            <>
              <button
                ref={removeBtnRef}
                class="skill-bar-action skill-bar-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmOpen(true);
                }}
              >
                Remove
              </button>
              <ConfirmPopover
                anchorRef={removeBtnRef}
                open={confirmOpen}
                message={`Remove ${skillName}?`}
                confirmText="Remove"
                cancelText="Keep"
                type="danger"
                onConfirm={() => {
                  setConfirmOpen(false);
                  handleRemove();
                }}
                onCancel={() => setConfirmOpen(false)}
              />
            </>
          )}
          <Chevron expanded={expanded} />
        </div>
      </div>
      {expanded && (
        <div class="bottom-bar-body">
          {adding ? (
            <SkillForm
              disabled={false}
              name={newName}
              onNameChange={setNewName}
              stat={newStat}
              onStatChange={setNewStat}
              combat={newCombat}
              onCombatChange={setNewCombat}
              description=""
            />
          ) : entry ? (
            <SkillForm
              disabled
              name={skillName!}
              stat={entry.stat}
              combat={entry.combat}
              description={description}
            />
          ) : null}
        </div>
      )}
    </>
  );
};
