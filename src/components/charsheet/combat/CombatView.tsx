import { Panel } from "../shared";
import { TwoPanelView } from "../shared/TwoPanelView";

import { CharacterArmorPanel } from "./CharacterArmorPanel";
import { CombatPanel } from "./CombatPanel";

export const CombatView = () => (
  <TwoPanelView
    renderFirst={(expanded, onToggle) => (
      <CharacterArmorPanel expanded={expanded} onToggle={onToggle} />
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
