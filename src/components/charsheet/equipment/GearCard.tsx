import type { GearTemplate } from "@scripts/gear/catalog";
import { addGear, removeGear } from "@stores/gear";
import { selectGear } from "@stores/ui";

import { ItemCard } from "../shared/ItemCard";
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
    <ItemCard
      class="gear-card"
      selected={selected}
      owned={quantity > 0}
      custom={custom}
      onClick={() => selectGear(selected ? null : id)}
      name={template.name}
      meta={<ItemMeta availability={template.availability} cost={template.cost} />}
    >
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
    </ItemCard>
  );
}
