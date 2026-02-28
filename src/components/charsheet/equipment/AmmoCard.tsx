import type { AmmoTemplate } from "@scripts/ammo/catalog";
import { addAmmo, removeAmmo } from "@stores/ammo";
import { selectAmmo } from "@stores/ui";

import { ItemMeta } from "../shared/ItemMeta";

interface Props {
  template: AmmoTemplate;
  quantity: number;
  custom?: boolean;
  selected?: boolean;
  highlighted?: boolean;
}

export function AmmoCard({
  template,
  quantity,
  custom,
  selected,
  highlighted,
}: Props) {
  const id = template.templateId;
  return (
    <div
      class={`item-card ammo-card${selected ? " selected" : ""}${highlighted ? " highlighted" : ""}${custom ? " item-card-accent" : ""}`}
      onClick={() => selectAmmo(selected ? null : id)}
    >
      <div class="flex-between gap-8">
        <h4>
          {template.caliber}{" "}
          <span class="ammo-card-type">{template.type}</span>{" "}
          {template.damage}
        </h4>
        <ItemMeta availability={template.availability} cost={template.cost} />
      </div>
      {template.effects && (
        <div class="ammo-card-effects text-soft">{template.effects}</div>
      )}
      <div class="gear-actions">
        {quantity > 0 ? (
          <div class="gear-qty-controls ammo-qty-controls">
            <button
              class="btn-sm ammo-qty-btn"
              onClick={(e) => {
                e.stopPropagation();
                removeAmmo(id, 100);
              }}
            >
              −100
            </button>
            <button
              class="btn-sm ammo-qty-btn"
              onClick={(e) => {
                e.stopPropagation();
                removeAmmo(id);
              }}
            >
              −
            </button>
            <span class="gear-qty-value cc-ammo-value">{quantity}</span>
            <button
              class="btn-sm ammo-qty-btn"
              onClick={(e) => {
                e.stopPropagation();
                addAmmo(id, 1);
              }}
            >
              +
            </button>
            <button
              class="btn-sm ammo-qty-btn"
              onClick={(e) => {
                e.stopPropagation();
                addAmmo(id, 100);
              }}
            >
              +100
            </button>
          </div>
        ) : (
          <button
            class="btn-sm gear-take-btn"
            onClick={(e) => {
              e.stopPropagation();
              addAmmo(id);
            }}
          >
            Take
          </button>
        )}
      </div>
    </div>
  );
}
