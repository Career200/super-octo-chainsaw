import type { ComponentChildren } from "preact";

import { useScrollOnSelect } from "./useScrollOnSelect";

interface Props {
  /** Extra class(es) appended after item-card, e.g. "weapon-card" */
  class?: string;
  selected?: boolean;
  highlighted?: boolean;
  /** User owns this item — thin pale left border */
  owned?: boolean;
  /** Item is equipped/worn/installed — thick accent left border (overrides owned) */
  equipped?: boolean;
  /** Custom-created item — subtle accent right border */
  custom?: boolean;
  onClick?: () => void;
  /** Card title — usually just a string, but can include an icon span */
  name: ComponentChildren;
  /** Right side of the header row (ItemMeta, SP badge, HC, etc.) */
  meta?: ComponentChildren;
  children?: ComponentChildren;
}

export function ItemCard({
  class: extraClass,
  selected,
  highlighted,
  owned,
  equipped,
  custom,
  onClick,
  name,
  meta,
  children,
}: Props) {
  const shouldScroll = !!(selected || highlighted);
  const ref = useScrollOnSelect<HTMLDivElement>(shouldScroll);

  const cls = [
    "item-card",
    extraClass,
    custom && "item-card-custom",
    owned && "item-card-owned",
    equipped && "item-card-equipped",
    selected && "selected",
    highlighted && "highlighted",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} class={cls} onClick={onClick}>
      <div class="flex-between gap-8">
        <h4>{name}</h4>
        {meta}
      </div>
      {children}
    </div>
  );
}
