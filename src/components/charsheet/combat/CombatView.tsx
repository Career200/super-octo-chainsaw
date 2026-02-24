import { Panel } from "../shared";
import { TwoPanelView } from "../shared/TwoPanelView";

import { CombatPanel } from "./CombatPanel";
import DefensePanel from "./DefensePanel";

export default function CombatView() {
  return (
    <TwoPanelView
      renderFirst={(expanded, onToggle) => (
        <DefensePanel expanded={expanded} onToggle={onToggle} />
      )}
      renderSecond={(expanded, onToggle) => (
        <Panel
          id="combat-offense-panel"
          title="Offense"
          expanded={expanded}
          onToggle={onToggle}
        >
          <CombatPanel />
        </Panel>
      )}
    />
  );
}
