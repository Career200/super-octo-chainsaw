import type { Availability } from "@scripts/catalog-common";
import { AVAILABILITY_LABELS } from "@scripts/catalog-common";

import { Tip } from "./Tip";

type AvailabilityWithEmpty = Availability | "";

interface Props {
  value: string;
  onChange?: (v: AvailabilityWithEmpty) => void;
}

export function AvailabilitySelect({ value, onChange }: Props) {
  return (
    <Tip label="Street availability" class="item-form-availability">
      <select
        class={`input item-form-input avail-${value || "C"}`}
        value={value}
        disabled={!onChange}
        onChange={
          onChange
            ? (e) =>
                onChange(
                  (e.target as HTMLSelectElement).value as AvailabilityWithEmpty,
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
  );
}
