import { Panel } from "../shared";
import { TwoPanelView } from "../shared/TwoPanelView";

import { CharacterArmorPanel } from "./CharacterArmorPanel";
import { CombatPanel } from "./CombatPanel";

export const Biomonitor = () => (
  <TwoPanelView
    renderFirst={(expanded, onToggle) => (
      <CharacterArmorPanel expanded={expanded} onToggle={onToggle} />
    )}
    renderSecond={(expanded, onToggle) => (
      <Panel
        id="biomon-combat-panel"
        title="Combat"
        expanded={expanded}
        onToggle={onToggle}
      >
        <CombatPanel />
      </Panel>
    )}
  />
);
