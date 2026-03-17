import type { AmmoTemplate } from "@scripts/ammo/catalog";
import { AVAILABILITY_LABELS } from "@scripts/catalog-common";
import { addAmmo, removeAmmo } from "@stores/ammo";

export function AmmoDetail({
  template,
  quantity,
}: {
  template: AmmoTemplate;
  quantity: number;
}) {
  return (
    <div class="weapon-detail">
      <div class="weapon-detail-stats">
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">Caliber</span>
          {template.caliber}
        </span>
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">Type</span>
          {template.type}
        </span>
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">Damage</span>
          {template.damage}
        </span>
        {template.cost != null && (
          <span class="weapon-detail-stat">
            <span class="weapon-detail-label">Cost</span>
            {template.cost}eb / {template.boxSize}
          </span>
        )}
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">Avail.</span>
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
      <div class="gear-qty-controls cc-ammo-stepper">
        <button
          class="btn-sm ammo-qty-btn ammo-qty-btn-box"
          onClick={() => removeAmmo(template.templateId, template.boxSize)}
        >
          −{template.boxSize}
        </button>
        <button
          class="btn-sm ammo-qty-btn"
          onClick={() => removeAmmo(template.templateId)}
        >
          −
        </button>
        <span class="gear-qty-value cc-ammo-value">{quantity}</span>
        <button
          class="btn-sm ammo-qty-btn"
          onClick={() => addAmmo(template.templateId, 1)}
        >
          +
        </button>
        <button
          class="btn-sm ammo-qty-btn ammo-qty-btn-box"
          onClick={() => addAmmo(template.templateId, template.boxSize)}
        >
          +{template.boxSize}
        </button>
      </div>
    </div>
  );
}
