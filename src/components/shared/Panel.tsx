import { useState } from "preact/hooks";
import type { ComponentChildren } from "preact";

interface Props {
  id: string;
  title: ComponentChildren;
  defaultExpanded?: boolean;
  headerActions?: ComponentChildren;
  /** When true, children are rendered directly without a .panel-content wrapper */
  bare?: boolean;
  children: ComponentChildren;
}

export const Panel = ({
  id,
  title,
  defaultExpanded = false,
  headerActions,
  bare = false,
  children,
}: Props) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select")) return;
    if (expanded && target.closest(".panel-content, .body-grid")) return;
    setExpanded(!expanded);
  };

  return (
    <div
      class={`panel panel-collapsible${expanded ? " expanded" : ""}`}
      id={id}
      onClick={handleClick}
    >
      <div class="panel-heading">
        <h2>{title}</h2>
        {headerActions}
      </div>
      {bare ? children : <div class="panel-content">{children}</div>}
      <div class="expand-indicator" />
    </div>
  );
};
