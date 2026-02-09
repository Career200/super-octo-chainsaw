import { Panel } from "@components/shared/Panel";
import { HelpPopover } from "@components/shared/HelpPopover";
import { BodyPartGrid } from "./body/BodyPartGrid";
import { HitPopover } from "./HitPopover";
import { ArmorHelpContent } from "./help/ArmorHelpContent";

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
