import type { ComponentChildren, Ref } from "preact";

import { Chevron } from "./Chevron";

interface Props {
  label: ComponentChildren;
  count?: number;
  collapsed: boolean;
  onToggle?: () => void;
  class?: string;
  rootRef?: Ref<HTMLDivElement>;
  /** Extra attributes spread onto the root div (e.g. data-caliber) */
  rootProps?: Record<string, string>;
  restCount: number;
  children: ComponentChildren;
}

export function CollapsibleGroup({
  label,
  count,
  collapsed,
  onToggle,
  class: extraClass,
  rootRef,
  rootProps,
  restCount,
  children,
}: Props) {
  const canExpand = !!onToggle && restCount > 0;
  return (
    <div
      ref={rootRef}
      class={`gear-group${extraClass ? ` ${extraClass}` : ""}`}
      {...rootProps}
    >
      <div
        class={`gear-group-label${collapsed && canExpand ? " collapsed" : ""}${canExpand ? "" : " no-expand"}`}
        onClick={onToggle}
      >
        <span>
          {label}
          {count != null && <span class="gear-group-count">{count}</span>}
        </span>
        {canExpand && <Chevron expanded={!collapsed} />}
      </div>
      {children}
      {collapsed && canExpand && (
        <div class="gear-group-more" onClick={onToggle}>
          +{restCount} more
        </div>
      )}
    </div>
  );
}
