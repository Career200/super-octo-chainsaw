import { BodyPartGrid } from "../equipment/body/BodyPartGrid";
import { ArmorHelpContent } from "../equipment/help/ArmorHelpContent";
import { HitPopover } from "../equipment/HitPopover";
import { HelpPopover } from "../shared/HelpPopover";
import { Panel } from "../shared/Panel";

export const CharacterArmorPanel = ({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) => {
  return (
    <Panel
      id="character-armor-panel"
      title={
        <>
          Body Armor{" "}
          <HelpPopover id="armor-help" content={<ArmorHelpContent />} />
        </>
      }
      expanded={expanded}
      onToggle={onToggle}
      headerActions={<HitPopover />}
    >
      <BodyPartGrid />
    </Panel>
  );
};
