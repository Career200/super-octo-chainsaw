import { useStore } from "@nanostores/preact";

import { tabStore } from "@stores/ui";

import { CombatView } from "./combat";
import { AwarenessLine } from "./combat/AwarenessLine";
import { BodyInfo } from "./combat/BodyInfo";
import { StatsStrip } from "./combat/StatsStrip";
import { WoundTracker } from "./combat/WoundTracker";
import { BottomBar } from "./common/bottombar/BottomBar";
import { DossierView } from "./dossier/DossierView";
import { EquipmentView } from "./equipment/EquipmentView";
import { TabStrip } from "./shared/TabStrip";

const SPA_TABS = [
  { id: "combat", label: "COMBAT" },
  { id: "dossier", label: "DOSSIER" },
  { id: "equipment", label: "EQUIP" },
];

export const Charsheet = () => {
  const tab = useStore(tabStore("spa-tab", "combat"));

  const spaClass = `charsheet-spa ${tab}-section`;

  return (
    <div class={spaClass}>
      <div class="fixed-bar">
        <WoundTracker />
        <div class="secondary-bar flex-between">
          <StatsStrip />
          <BodyInfo />
        </div>
        <div class="tab-row">
          <TabStrip tabs={SPA_TABS} persist="spa-tab" class="spa-tabs" />
          <AwarenessLine />
        </div>
      </div>
      {tab === "combat" && <CombatView />}
      {tab === "dossier" && <DossierView />}
      {tab === "equipment" && <EquipmentView />}
      <BottomBar />
    </div>
  );
};
