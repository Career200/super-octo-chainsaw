import { useState, useEffect, useRef } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import type {
  WeaponType,
  Concealability,
  Reliability,
} from "@scripts/weapons/catalog";
import {
  WEAPON_TYPE_LABELS,
  CONCEALABILITY_LABELS,
  RELIABILITY_LABELS,
  skillForType,
} from "@scripts/weapons/catalog";
import { $allSkills } from "@stores/skills";
import { Popover, Tip, cls } from "../shared";

/** Types where the user can pick a custom skill name. Others auto-derive from type. */
function isSkillEditable(type: WeaponType): boolean {
  return type === "EX" || type === "melee";
}

interface Props {
  type: WeaponType;
  onTypeChange?: (v: WeaponType) => void;
  skill: string;
  onSkillChange?: (v: string) => void;
  wa: string;
  onWaChange?: (v: string) => void;
  concealability: Concealability;
  onConcealabilityChange?: (v: Concealability) => void;
  ammo: string;
  onAmmoChange?: (v: string) => void;
  damage: string;
  onDamageChange?: (v: string) => void;
  shots: string;
  onShotsChange?: (v: string) => void;
  rof: string;
  onRofChange?: (v: string) => void;
  reliability: Reliability;
  onReliabilityChange?: (v: Reliability) => void;
  range: string;
  onRangeChange?: (v: string) => void;
  melee: boolean;
  /** Field names that should show error styling */
  errors?: ReadonlySet<string>;
}

export function WeaponFormFields({
  type,
  onTypeChange,
  skill,
  onSkillChange,
  wa,
  onWaChange,
  concealability,
  onConcealabilityChange,
  ammo,
  onAmmoChange,
  damage,
  onDamageChange,
  shots,
  onShotsChange,
  rof,
  onRofChange,
  reliability,
  onReliabilityChange,
  range,
  onRangeChange,
  melee,
  errors,
}: Props) {
  const allSkills = useStore($allSkills);
  const skillCanEdit = isSkillEditable(type);
  const displaySkill = skillCanEdit ? skill : skillForType(type);

  // Debounced skill-not-found check (500ms), case-insensitive
  const [skillWarning, setSkillWarning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const trimmed = displaySkill.trim().toLowerCase();
    if (!trimmed) {
      setSkillWarning(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      const found = Object.keys(allSkills).some(
        (k) => k.toLowerCase() === trimmed,
      );
      setSkillWarning(!found);
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displaySkill, allSkills]);

  const skillRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Tip label="Weapon type" class="weapon-form-type">
        <select
          class="input item-form-input"
          value={type}
          disabled={!onTypeChange}
          onChange={
            onTypeChange
              ? (e) =>
                  onTypeChange(
                    (e.target as HTMLSelectElement).value as WeaponType,
                  )
              : undefined
          }
          title="Weapon type"
        >
          {Object.entries(WEAPON_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </Tip>
      <Tip label="Associated skill" class="weapon-form-skill">
        <div ref={skillRef}>
          <input
            type="text"
            class={cls("input item-form-input", skillWarning && "input-error")}
            value={displaySkill}
            disabled={!skillCanEdit || !onSkillChange}
            onInput={
              onSkillChange && skillCanEdit
                ? (e) => onSkillChange((e.target as HTMLInputElement).value)
                : undefined
            }
            placeholder="Skill"
            title="Associated skill"
          />
          <Popover
            anchorRef={skillRef}
            open={skillWarning}
            onClose={() => {
              /* stays until fixed */
            }}
            className="popover-info"
          >
            <p class="popover-message">Skill "{displaySkill.trim()}" not found</p>
          </Popover>
        </div>
      </Tip>
      {!melee && (
        <Tip label="Ammo caliber" class="weapon-form-ammo">
          <input
            type="text"
            class="input item-form-input"
            value={ammo}
            disabled={!onAmmoChange}
            onInput={
              onAmmoChange
                ? (e) => onAmmoChange((e.target as HTMLInputElement).value)
                : undefined
            }
            placeholder="Caliber"
            title="Ammo caliber"
          />
        </Tip>
      )}
      <Tip label="Damage dice" class="weapon-form-damage">
        <input
          type="text"
          class={cls(
            "input item-form-input",
            errors?.has("damage") && "input-error",
          )}
          value={damage}
          disabled={!onDamageChange}
          onInput={
            onDamageChange
              ? (e) => onDamageChange((e.target as HTMLInputElement).value)
              : undefined
          }
          placeholder="Damage"
          title="Damage dice"
        />
      </Tip>
      <Tip label="Weapon accuracy" class="weapon-form-wa">
        <input
          type="number"
          class="input item-form-input"
          value={wa}
          disabled={!onWaChange}
          onInput={
            onWaChange
              ? (e) => onWaChange((e.target as HTMLInputElement).value)
              : undefined
          }
          placeholder="WA"
          title="Weapon accuracy"
        />
      </Tip>
      <Tip label="Concealability rating" class="weapon-form-conceal">
        <select
          class="input item-form-input"
          value={concealability}
          disabled={!onConcealabilityChange}
          onChange={
            onConcealabilityChange
              ? (e) =>
                  onConcealabilityChange(
                    (e.target as HTMLSelectElement).value as Concealability,
                  )
              : undefined
          }
          title="Concealability rating"
        >
          {Object.entries(CONCEALABILITY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </Tip>
      {!melee && (
        <>
          <Tip label="Magazine capacity" class="weapon-form-shots">
            <input
              type="number"
              class="input item-form-input"
              value={shots}
              disabled={!onShotsChange}
              onInput={
                onShotsChange
                  ? (e) => onShotsChange((e.target as HTMLInputElement).value)
                  : undefined
              }
              placeholder="Shots"
              title="Magazine capacity"
              min="0"
            />
          </Tip>
          <Tip label="Range in meters" class="weapon-form-range">
            <input
              type="number"
              class="input item-form-input"
              value={range}
              disabled={!onRangeChange}
              onInput={
                onRangeChange
                  ? (e) => onRangeChange((e.target as HTMLInputElement).value)
                  : undefined
              }
              placeholder="Range"
              title="Range in meters"
              min="0"
            />
          </Tip>
        </>
      )}
      <Tip label="Rate of fire" class="weapon-form-rof">
        <input
          type="number"
          class="input item-form-input"
          value={rof}
          disabled={!onRofChange}
          onInput={
            onRofChange
              ? (e) => onRofChange((e.target as HTMLInputElement).value)
              : undefined
          }
          placeholder="RoF"
          title="Rate of fire"
          min="0"
        />
      </Tip>
      <Tip label="Weapon reliability" class="weapon-form-rel">
        <select
          class="input item-form-input"
          value={reliability}
          disabled={!onReliabilityChange}
          onChange={
            onReliabilityChange
              ? (e) =>
                  onReliabilityChange(
                    (e.target as HTMLSelectElement).value as Reliability,
                  )
              : undefined
          }
          title="Weapon reliability"
        >
          {Object.entries(RELIABILITY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </Tip>
    </>
  );
}
