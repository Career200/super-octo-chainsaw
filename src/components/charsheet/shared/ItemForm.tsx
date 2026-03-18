import type { ComponentChildren } from "preact";

import type { Availability } from "@scripts/catalog-common";

import { cls, Tip } from ".";
import { AvailabilitySelect } from "./AvailabilitySelect";

interface Props {
  disabled: boolean;
  name: string;
  onNameChange?: (v: string) => void;
  cost: string;
  onCostChange?: (v: string) => void;
  availability: string;
  onAvailabilityChange?: (v: Availability | "") => void;
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
          class={cls(
            "input item-form-input item-form-name",
            errors?.has("name") && "input-error",
          )}
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
        <AvailabilitySelect
          value={availability}
          onChange={onAvailabilityChange}
        />
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
