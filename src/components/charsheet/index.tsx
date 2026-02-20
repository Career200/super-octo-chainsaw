import { useStore } from "@nanostores/preact";

import { tabStore } from "@stores/ui";

import { Biomonitor } from "./biomon";
import { AwarenessLine } from "./biomon/AwarenessLine";
import { BodyInfo } from "./biomon/BodyInfo";
import { StatsStrip } from "./biomon/StatsStrip";
import { WoundTracker } from "./biomon/WoundTracker";
import { BottomBar } from "./common/bottombar/BottomBar";
import { DossierView } from "./dossier/DossierView";
import { EquipmentView } from "./equipment/EquipmentView";
import { TabStrip } from "./shared/TabStrip";

const SPA_TABS = [
  { id: "biomon", label: "BIOMON" },
  { id: "dossier", label: "DOSSIER" },
  { id: "equipment", label: "EQUIP" },
];

export const Charsheet = () => {
  const tab = useStore(tabStore("spa-tab", "biomon"));

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
      {tab === "biomon" && <Biomonitor />}
      {tab === "dossier" && <DossierView />}
      {tab === "equipment" && <EquipmentView />}
      <BottomBar />
    </div>
  );
};
