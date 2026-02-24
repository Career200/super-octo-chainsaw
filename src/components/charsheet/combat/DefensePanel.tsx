import { BodyPartGrid } from "../equipment/body/BodyPartGrid";
import { HitPopover } from "../equipment/HitPopover";
import { Panel } from "../shared/Panel";

import { DamageInfo } from "./DamageInfo";
import WoundTracker from "./WoundTracker";

export default function DefensePanel({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Panel
      id="combat-defense-panel"
      title="Defense"
      expanded={expanded}
      onToggle={onToggle}
      headerActions={<><DamageInfo /><HitPopover /></>}
    >
      <WoundTracker />
      <div class="defense-armor">
        <BodyPartGrid mode="combat" />
      </div>
    </Panel>
  );
}
