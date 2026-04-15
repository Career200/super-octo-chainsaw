import type { AmmoTemplate } from "@scripts/ammo/catalog";
import { AVAILABILITY_LABELS } from "@scripts/catalog-common";

export function AmmoDetail({ template }: { template: AmmoTemplate }) {
  return (
    <div class="weapon-detail">
      <div class="detail-stats">
        <span class="detail-stat">
          <span class="detail-label">Caliber</span>
          {template.caliber}
        </span>
        <span class="detail-stat">
          <span class="detail-label">Type</span>
          {template.type}
        </span>
        <span class="detail-stat">
          <span class="detail-label">Damage</span>
          {template.damage}
        </span>
        {template.cost != null && (
          <span class="detail-stat">
            <span class="detail-label">Cost</span>
            {template.cost}eb / {template.boxSize}
          </span>
        )}
        <span class="detail-stat">
          <span class="detail-label">Avail.</span>
          <span class={`avail-${template.availability ?? "C"}`}>
            {AVAILABILITY_LABELS[template.availability ?? "C"]}
          </span>
        </span>
      </div>
      {template.effects && (
        <p class="text-desc" style="color: var(--accent)">
          {template.effects}
        </p>
      )}
      {template.description && <p class="text-desc">{template.description}</p>}
    </div>
  );
}
