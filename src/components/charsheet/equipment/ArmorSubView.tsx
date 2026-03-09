import { useStore } from "@nanostores/preact";

import {
  $ownedArmor,
  getAllOwnedArmor,
  isImplant,
  unwearAll,
} from "@stores/armor";
import { $selectedArmor, selectArmor } from "@stores/ui";

import { HelpPopover } from "../shared/HelpPopover";
import { Panel } from "../shared/Panel";
import { TwoPanelView } from "../shared/TwoPanelView";

import { ArmorListPanel } from "./ArmorListPanel";
import { BodyPartGrid } from "./body/BodyPartGrid";
import { ArmorHelpContent } from "./help/ArmorHelpContent";

export default function ArmorSubView() {
  const selectedArmorId = useStore($selectedArmor);
  useStore($ownedArmor); // subscribe so hasWorn recalculates on armor changes
  const hasWorn = getAllOwnedArmor().some((a) => a.worn && !isImplant(a));

  return (
    <TwoPanelView
      renderFirst={(expanded, onToggle) => (
        <ArmorListPanel
          expanded={expanded}
          onToggle={onToggle}
          selectedId={selectedArmorId}
          onSelect={(id) => selectArmor(id)}
        />
      )}
      renderSecond={(expanded, onToggle) => (
        <Panel
          id="armor-grid-panel"
          title={
            <>
              WORN ARMOR{" "}
              <HelpPopover id="armor-help-eq" content={<ArmorHelpContent />} />
            </>
          }
          expanded={expanded}
          onToggle={onToggle}
          headerActions={
            hasWorn ? (
              <button class="btn-ghost btn-sm" onClick={() => unwearAll()}>
                Remove All
              </button>
            ) : undefined
          }
        >
          <BodyPartGrid mode="inventory" />
        </Panel>
      )}
    />
  );
}
