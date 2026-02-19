import type { ComponentChildren } from "preact";
import { AVAILABILITY_LABELS } from "@scripts/catalog-common";
import type { Availability } from "@scripts/catalog-common";

type AvailabilityWithEmpty = Availability | "";

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
  children,
}: Props) {
  return (
    <div class="item-form">
      <div class="item-form-fields">
        <input
          type="text"
          class="input item-form-input item-form-name"
          value={name}
          disabled={disabled}
          onInput={
            onNameChange
              ? (e) => onNameChange((e.target as HTMLInputElement).value)
              : undefined
          }
          placeholder="Name"
          autoFocus={!disabled}
        />
        {children}
        <input
          type="number"
          class="input item-form-input item-form-cost"
          value={cost}
          disabled={!onCostChange}
          onInput={
            onCostChange
              ? (e) => onCostChange((e.target as HTMLInputElement).value)
              : undefined
          }
          placeholder="Cost"
          min="0"
        />
        <select
          class="input item-form-input item-form-availability"
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
        >
          <option value="">Availability</option>
          {Object.entries(AVAILABILITY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
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
      />
    </div>
  );
}
