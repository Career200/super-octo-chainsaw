import { Tip } from "@components/charsheet/shared";
import { AvailabilitySelect } from "@components/charsheet/shared/AvailabilitySelect";
import { CALIBER_DAMAGE } from "@scripts/weapons/catalog";

export function AmmoForm({
  caliber,
  onCaliberChange,
  type,
  onTypeChange,
  damage,
  onDamageChange,
  effects,
  onEffectsChange,
  description,
  onDescriptionChange,
  cost,
  onCostChange,
  boxSize,
  onBoxSizeChange,
  availability,
  onAvailabilityChange,
  errors,
  autoFocus,
}: {
  caliber: string;
  onCaliberChange?: (v: string) => void;
  type: string;
  onTypeChange?: (v: string) => void;
  damage: string;
  onDamageChange?: (v: string) => void;
  effects: string;
  onEffectsChange?: (v: string) => void;
  description: string;
  onDescriptionChange?: (v: string) => void;
  cost: string;
  onCostChange?: (v: string) => void;
  boxSize: string;
  onBoxSizeChange?: (v: string) => void;
  availability: string;
  onAvailabilityChange?: (v: string) => void;
  errors?: ReadonlySet<string>;
  autoFocus?: boolean;
}) {
  const inp = (
    field: string,
    value: string,
    onChange: ((v: string) => void) | undefined,
    placeholder: string,
    title: string,
    className: string,
    opts?: { type?: string; min?: string; autoFocus?: boolean; list?: string },
  ) => (
    <input
      type={opts?.type ?? "text"}
      list={opts?.list}
      class={`input item-form-input ${className}${errors?.has(field) ? " input-error" : ""}`}
      value={value}
      disabled={!onChange}
      onInput={
        onChange
          ? (e) => onChange((e.target as HTMLInputElement).value)
          : undefined
      }
      placeholder={placeholder}
      title={title}
      autoFocus={opts?.autoFocus}
      min={opts?.min}
    />
  );

  return (
    <div class="item-form">
      <div class="item-form-fields">
        <span class="weapon-form-ammo">
          {inp(
            "caliber",
            caliber,
            onCaliberChange,
            "Caliber",
            "Caliber (e.g. 9mm, .45)",
            "",
            { autoFocus, list: "caliber-suggestions" },
          )}
          <datalist id="caliber-suggestions">
            {Object.keys(CALIBER_DAMAGE).map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </span>
        {inp(
          "type",
          type,
          onTypeChange,
          "Type",
          "Ammo type (e.g. std, ap)",
          "weapon-form-type",
        )}
        {inp(
          "damage",
          damage,
          onDamageChange,
          "Damage",
          "Damage dice (e.g. 2D6+1)",
          "weapon-form-damage",
        )}
        <Tip label="Cost per box (eb)" class="item-form-cost">
          {inp(
            "cost",
            cost,
            onCostChange,
            "Cost",
            "Cost per box in eurobucks",
            "",
            { type: "number", min: "0" },
          )}
        </Tip>
        <Tip label="Box size" class="item-form-box-size">
          {inp(
            "boxSize",
            boxSize,
            onBoxSizeChange,
            "Box",
            "Rounds per box",
            "",
            { type: "number", min: "1" },
          )}
        </Tip>
        <AvailabilitySelect
          value={availability}
          onChange={onAvailabilityChange}
        />
      </div>
      <div class="ammo-form-bottom">
        <div class="ammo-form-half">
          <span class="text-desc">Effects</span>
          <textarea
            class={`input ammo-form-effects${errors?.has("effects") ? " input-error" : ""}`}
            value={effects}
            disabled={!onEffectsChange}
            onInput={
              onEffectsChange
                ? (e) =>
                    onEffectsChange((e.target as HTMLTextAreaElement).value)
                : undefined
            }
            placeholder="Effects"
            title="Special effects"
          />
        </div>
        <div class="ammo-form-half">
          <span class="text-desc">Description</span>
          <textarea
            class="input item-form-description"
            value={description}
            disabled={!onDescriptionChange}
            onInput={
              onDescriptionChange
                ? (e) =>
                    onDescriptionChange((e.target as HTMLTextAreaElement).value)
                : undefined
            }
            placeholder="No description"
            title="Description"
          />
        </div>
      </div>
    </div>
  );
}
