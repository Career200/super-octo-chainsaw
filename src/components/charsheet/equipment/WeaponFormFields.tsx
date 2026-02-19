import type { WeaponType, Concealability, Reliability } from "@scripts/weapons/catalog";
import { WEAPON_TYPE_LABELS, CONCEALABILITY_LABELS, RELIABILITY_LABELS, skillForType } from "@scripts/weapons/catalog";

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
}

export function WeaponFormFields({
  type, onTypeChange,
  skill, onSkillChange,
  wa, onWaChange,
  concealability, onConcealabilityChange,
  ammo, onAmmoChange,
  damage, onDamageChange,
  shots, onShotsChange,
  rof, onRofChange,
  reliability, onReliabilityChange,
  range, onRangeChange,
  melee,
}: Props) {
  const skillCanEdit = isSkillEditable(type);
  const displaySkill = skillCanEdit ? skill : skillForType(type);

  return (
    <>
      <select
        class="input item-form-input weapon-form-type"
        value={type}
        disabled={!onTypeChange}
        onChange={onTypeChange
          ? (e) => onTypeChange((e.target as HTMLSelectElement).value as WeaponType)
          : undefined
        }
      >
        {Object.entries(WEAPON_TYPE_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      <input
        type="text"
        class="input item-form-input weapon-form-skill"
        value={displaySkill}
        disabled={!skillCanEdit || !onSkillChange}
        onInput={onSkillChange && skillCanEdit
          ? (e) => onSkillChange((e.target as HTMLInputElement).value)
          : undefined
        }
        placeholder="Skill"
      />
      {!melee && (
        <input
          type="text"
          class="input item-form-input weapon-form-ammo"
          value={ammo}
          disabled={!onAmmoChange}
          onInput={onAmmoChange
            ? (e) => onAmmoChange((e.target as HTMLInputElement).value)
            : undefined
          }
          placeholder="Caliber"
        />
      )}
      <input
        type="text"
        class="input item-form-input weapon-form-damage"
        value={damage}
        disabled={!onDamageChange}
        onInput={onDamageChange
          ? (e) => onDamageChange((e.target as HTMLInputElement).value)
          : undefined
        }
        placeholder="Damage"
      />
      <input
        type="number"
        class="input item-form-input weapon-form-wa"
        value={wa}
        disabled={!onWaChange}
        onInput={onWaChange
          ? (e) => onWaChange((e.target as HTMLInputElement).value)
          : undefined
        }
        placeholder="WA"
      />
      <select
        class="input item-form-input weapon-form-conceal"
        value={concealability}
        disabled={!onConcealabilityChange}
        onChange={onConcealabilityChange
          ? (e) => onConcealabilityChange((e.target as HTMLSelectElement).value as Concealability)
          : undefined
        }
      >
        {Object.entries(CONCEALABILITY_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      {!melee && (
        <>
          <input
            type="number"
            class="input item-form-input weapon-form-shots"
            value={shots}
            disabled={!onShotsChange}
            onInput={onShotsChange
              ? (e) => onShotsChange((e.target as HTMLInputElement).value)
              : undefined
            }
            placeholder="Shots"
            min="0"
          />
          <input
            type="number"
            class="input item-form-input weapon-form-range"
            value={range}
            disabled={!onRangeChange}
            onInput={onRangeChange
              ? (e) => onRangeChange((e.target as HTMLInputElement).value)
              : undefined
            }
            placeholder="Range"
            min="0"
          />
        </>
      )}
      <input
        type="number"
        class="input item-form-input weapon-form-rof"
        value={rof}
        disabled={!onRofChange}
        onInput={onRofChange
          ? (e) => onRofChange((e.target as HTMLInputElement).value)
          : undefined
        }
        placeholder="RoF"
        min="0"
      />
      <select
        class="input item-form-input weapon-form-rel"
        value={reliability}
        disabled={!onReliabilityChange}
        onChange={onReliabilityChange
          ? (e) => onReliabilityChange((e.target as HTMLSelectElement).value as Reliability)
          : undefined
        }
      >
        {Object.entries(RELIABILITY_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </>
  );
}
