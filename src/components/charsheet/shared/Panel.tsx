import type { ComponentChildren } from "preact";

import { Chevron } from "./Chevron";

interface Props {
  id: string;
  title: ComponentChildren;
  expanded: boolean;
  onToggle: () => void;
  headerActions?: ComponentChildren;
  children: ComponentChildren;
}

export const Panel = ({
  id,
  title,
  expanded,
  onToggle,
  headerActions,
  children,
}: Props) => {
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select")) return;
    if (expanded && target.closest(".panel-content, .body-grid")) return;
    onToggle();
  };

  return (
    <div
      class={`panel panel-collapsible${expanded ? " expanded" : ""}`}
      id={id}
      onClick={handleClick}
    >
      <div class="panel-heading">
        <h2 class="title text-sm">{title}</h2>
        {headerActions}
        <Chevron expanded={expanded} class="panel-chevron" />
      </div>
      <div class="panel-content">{children}</div>
    </div>
  );
};
