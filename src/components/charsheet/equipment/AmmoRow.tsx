import type { AmmoTemplate } from "@scripts/ammo/catalog";
import { addAmmo, removeAmmo } from "@stores/ammo";
import { selectAmmo } from "@stores/ui";

interface Props {
  template: AmmoTemplate;
  quantity: number;
  custom?: boolean;
  selected?: boolean;
  highlighted?: boolean;
}

export function AmmoRow({
  template,
  quantity,
  custom,
  selected,
  highlighted,
}: Props) {
  const id = template.templateId;
  return (
    <div
      class={`ammo-row${selected ? " selected" : ""}${highlighted ? " highlighted" : ""}${custom ? " ammo-row-custom" : ""}`}
      onClick={() => selectAmmo(selected ? null : id)}
    >
      <span class="ammo-row-type">{template.type}</span>
      <span class="ammo-row-damage">{template.damage}</span>
      <span class="ammo-row-effects text-soft">{template.effects}</span>
      <span class="ammo-row-actions">
        {quantity > 0 ? (
          <span class="gear-qty-controls ammo-qty-controls">
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
          </span>
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
      </span>
    </div>
  );
}
