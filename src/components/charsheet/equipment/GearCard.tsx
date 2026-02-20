import type { GearTemplate } from "@scripts/gear/catalog";
import { addGear, removeGear } from "@stores/gear";
import { selectGear } from "@stores/ui";

import { ItemMeta } from "../shared/ItemMeta";

interface Props {
  id: string;
  template: GearTemplate;
  quantity: number;
  custom?: boolean;
  selected?: boolean;
}

export function GearCard({
  id,
  template,
  quantity,
  custom,
  selected,
}: Props) {
  return (
    <div
      class={`item-card gear-card${selected ? " selected" : ""}${custom ? " item-card-accent" : ""}`}
      onClick={() => selectGear(selected ? null : id)}
    >
      <div class="flex-between gap-8">
        <h4>{template.name}</h4>
        <ItemMeta availability={template.availability} cost={template.cost} />
      </div>
      <div class="gear-actions">
        {quantity > 0 ? (
          <div class="gear-qty-controls">
            <button
              class="btn-sm gear-qty-btn"
              onClick={(e) => {
                e.stopPropagation();
                removeGear(id);
              }}
            >
              −
            </button>
            <span class="gear-qty-value">{quantity}</span>
            <button
              class="btn-sm gear-qty-btn"
              onClick={(e) => {
                e.stopPropagation();
                addGear(id);
              }}
            >
              +
            </button>
          </div>
        ) : (
          <button
            class="btn-sm gear-take-btn"
            onClick={(e) => {
              e.stopPropagation();
              addGear(id);
            }}
          >
            Take
          </button>
        )}
      </div>
    </div>
  );
}
