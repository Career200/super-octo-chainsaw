import type { GearTemplate } from "@scripts/gear/catalog";
import { AVAILABILITY_LABELS } from "@scripts/gear/catalog";

interface Props {
  item: GearTemplate & { quantity?: number };
}

/** Read-only gear detail display for catalog/owned items. */
export function GearDetail({ item }: Props) {
  return (
    <div class="gear-detail">
      <div class="weapon-detail-stats">
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">Type</span>
          {item.type}
        </span>
        {item.cost != null && (
          <span class="weapon-detail-stat">
            <span class="weapon-detail-label">Cost</span>
            {item.cost}eb
          </span>
        )}
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">Avail.</span>
          <span class={`avail-${item.availability ?? "C"}`}>
            {AVAILABILITY_LABELS[item.availability ?? "C"]}
          </span>
        </span>
      </div>
      {item.description && <p class="text-desc">{item.description}</p>}
    </div>
  );
}
