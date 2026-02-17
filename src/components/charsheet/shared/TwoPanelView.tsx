import { useState } from "preact/hooks";
import type { ComponentChildren } from "preact";

type PanelRenderer = (
  expanded: boolean,
  onToggle: () => void,
) => ComponentChildren;

interface Props {
  renderFirst: PanelRenderer;
  renderSecond: PanelRenderer;
  onFirstCollapse?: () => void;
}

export const TwoPanelView = ({
  renderFirst,
  renderSecond,
  onFirstCollapse,
}: Props) => {
  const [firstExpanded, setFirstExpanded] = useState(true);
  const [secondExpanded, setSecondExpanded] = useState(true);

  const toggleFirst = () => {
    const next = !firstExpanded;
    setFirstExpanded(next);
    if (!next) {
      setSecondExpanded(true);
      onFirstCollapse?.();
    }
  };

  const toggleSecond = () => {
    const next = !secondExpanded;
    setSecondExpanded(next);
    if (!next) {
      setFirstExpanded(true);
    }
  };

  return (
    <div class="container">
      {renderFirst(firstExpanded, toggleFirst)}
      {renderSecond(secondExpanded, toggleSecond)}
    </div>
  );
};
