import { HitPopover } from "../../equipment/armor/HitPopover";
import { BodyPartGrid } from "../../equipment/body/BodyPartGrid";
import { HelpPopover } from "../../shared/HelpPopover";
import { Panel } from "../../shared/Panel";

import WoundTracker from "../wounds/WoundTracker";

import { ArmorHelpContent } from "./ArmorHelpContent";
import { DamageInfo } from "./DamageInfo";
import { DefenseHelpContent } from "./DefenseHelpContent";

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
