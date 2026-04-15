import { useRef, useState } from "preact/hooks";

import { STAT_LABELS, STAT_NAMES } from "@scripts/combat/stats";
import type { Maneuver, SkillStat } from "@scripts/skills/catalog";
import { MANEUVER_LABELS, MANEUVER_NAMES } from "@scripts/skills/catalog";

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

export interface SkillFormProps {
  autoFocus?: boolean;
  commitOnBlur?: boolean;
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

export function SkillForm({
  autoFocus,
  commitOnBlur,
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
  const isRename = commitOnBlur && !!onNameChange;
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
              autoFocus={autoFocus}
            />
          </label>
        )}
        <label class="skill-form-field skill-form-stat">
          <span class="skill-form-label">Stat</span>
          <select
            class="input skill-form-input"
            value={stat}
            disabled={!onStatChange}
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
            disabled={!onMeleeChange}
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
            disabled={!onMartialArtChange}
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
