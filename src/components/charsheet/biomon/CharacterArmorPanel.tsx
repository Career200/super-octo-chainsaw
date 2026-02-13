import { Panel } from "../shared/Panel";
import { HelpPopover } from "../shared/HelpPopover";
import { BodyPartGrid } from "../equipment/body/BodyPartGrid";
import { HitPopover } from "../equipment/HitPopover";
import { ArmorHelpContent } from "../equipment/help/ArmorHelpContent";

export const CharacterArmorPanel = () => {
  return (
    <Panel
      id="character-armor-panel"
      title={
        <>
          Character Armor{" "}
          <HelpPopover id="armor-help" content={<ArmorHelpContent />} />
        </>
      }
      defaultExpanded
      bare
      headerActions={<HitPopover />}
    >
      <BodyPartGrid />
    </Panel>
  );
};
