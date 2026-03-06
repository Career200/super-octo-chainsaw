import type { ComponentChildren } from "preact";

import { useScrollOnSelect } from "./useScrollOnSelect";

interface Props {
  /** Extra class(es) appended after item-card, e.g. "weapon-card" */
  class?: string;
  selected?: boolean;
  highlighted?: boolean;
  accent?: boolean;
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
  accent,
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
    accent && "item-card-accent",
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
