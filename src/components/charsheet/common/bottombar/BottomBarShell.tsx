import type { ComponentChildren } from "preact";

import { Chevron } from "@components/charsheet/shared/Chevron";

interface Props {
  expanded: boolean;
  onToggle: () => void;
  headerContent: ComponentChildren;
  actions?: ComponentChildren;
  children?: ComponentChildren;
}

export function BottomBarShell({
  expanded,
  onToggle,
  headerContent,
  actions,
  children,
}: Props) {
  return (
    <>
      <div class="bottom-bar-row expandable" onClick={onToggle}>
        <div class="bottom-bar-content">{headerContent}</div>
        <div class="bottom-bar-actions">
          {actions}
          <Chevron expanded={expanded} />
        </div>
      </div>
      {expanded && <div class="bottom-bar-body">{children}</div>}
    </>
  );
}
