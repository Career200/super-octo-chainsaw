import { Panel } from "../shared";
import { CharacterArmorPanel } from "./CharacterArmorPanel";

export const Biomonitor = () => (
  <div class="container">
    <CharacterArmorPanel />
    <Panel id="biomon-combat-panel" title="Combat" defaultExpanded>
      <p>Combat info goes here</p>
    </Panel>
  </div>
);
