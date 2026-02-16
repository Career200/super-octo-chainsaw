import { Panel } from "../shared";
import { TwoPanelView } from "../shared/TwoPanelView";
import { CharacterArmorPanel } from "./CharacterArmorPanel";

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
        <p>Combat info goes here</p>
      </Panel>
    )}
  />
);
