import { Panel } from "../shared/Panel";
import { HelpPopover } from "../shared/HelpPopover";
import { BodyPartGrid } from "../equipment/body/BodyPartGrid";
import { HitPopover } from "../equipment/HitPopover";
import { ArmorHelpContent } from "../equipment/help/ArmorHelpContent";

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
