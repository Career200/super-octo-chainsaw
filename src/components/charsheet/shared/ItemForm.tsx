import type { ComponentChildren } from "preact";
import { AVAILABILITY_LABELS } from "@scripts/catalog-common";
import type { Availability } from "@scripts/catalog-common";

type AvailabilityWithEmpty = Availability | "";

import { cls, Tip } from ".";

interface Props {
  disabled: boolean;
  name: string;
  onNameChange?: (v: string) => void;
  cost: string;
  onCostChange?: (v: string) => void;
  availability: string;
  onAvailabilityChange?: (v: AvailabilityWithEmpty) => void;
  description: string;
  onDescriptionChange?: (v: string) => void;
  /** Field names that should show error styling */
  errors?: ReadonlySet<string>;
  children?: ComponentChildren;
}

export function ItemForm({
  disabled,
  name,
  onNameChange,
  cost,
  onCostChange,
  availability,
  onAvailabilityChange,
  description,
  onDescriptionChange,
  errors,
  children,
}: Props) {
  return (
    <div class="item-form">
      <div class="item-form-fields">
        <input
          type="text"
          class={cls("input item-form-input item-form-name", errors?.has("name") && "input-error")}
          value={name}
          disabled={!onNameChange}
          onInput={
            onNameChange
              ? (e) => onNameChange((e.target as HTMLInputElement).value)
              : undefined
          }
          placeholder="Name"
          title="Name"
          autoFocus={!disabled}
        />
        {children}
        <Tip label="Cost in eurobucks" class="item-form-cost">
          <input
            type="number"
            class="input item-form-input"
            value={cost}
            disabled={!onCostChange}
            onInput={
              onCostChange
                ? (e) => onCostChange((e.target as HTMLInputElement).value)
                : undefined
            }
            placeholder="Cost"
            title="Cost in eurobucks"
            min="0"
          />
        </Tip>
        <Tip label="Street availability" class="item-form-availability">
          <select
            class="input item-form-input"
            value={availability}
            disabled={!onAvailabilityChange}
            onChange={
              onAvailabilityChange
                ? (e) =>
                    onAvailabilityChange(
                      (e.target as HTMLSelectElement)
                        .value as AvailabilityWithEmpty,
                    )
                : undefined
            }
            title="Street availability"
          >
            <option value="">Availability</option>
            {Object.entries(AVAILABILITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Tip>
      </div>
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
  );
}
