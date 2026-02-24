import { BodyPartGrid } from "../equipment/body/BodyPartGrid";
import { HitPopover } from "../equipment/HitPopover";
import { HelpPopover } from "../shared/HelpPopover";
import { Panel } from "../shared/Panel";

import { DamageInfo } from "./DamageInfo";
import { ArmorHelpContent } from "./help/ArmorHelpContent";
import { DefenseHelpContent } from "./help/DefenseHelpContent";
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
      title={
        <>
          Defense{" "}
          <HelpPopover id="defense-help" content={<DefenseHelpContent />} />
        </>
      }
      expanded={expanded}
      onToggle={onToggle}
      headerActions={<DamageInfo />}
    >
      <WoundTracker />
      <div class="defense-armor">
        <div class="panel-sub-heading">
          <span class="panel-sub-heading-title">Body Armor</span>
          <HelpPopover id="armor-help" content={<ArmorHelpContent />} />
          <HitPopover />
        </div>
        <BodyPartGrid mode="combat" />
      </div>
    </Panel>
  );
}
