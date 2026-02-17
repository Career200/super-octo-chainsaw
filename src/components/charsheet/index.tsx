import { useStore } from "@nanostores/preact";
import { Biomonitor } from "./biomon";
import { EquipmentView } from "./equipment/EquipmentView";
import { DossierView } from "./dossier/DossierView";
import { TabStrip } from "./shared/TabStrip";
import { WoundTracker } from "./biomon/WoundTracker";
import { BodyInfo } from "./biomon/BodyInfo";
import { StatsStrip } from "./biomon/StatsStrip";
import { AwarenessLine } from "./biomon/AwarenessLine";
import { $spaTab } from "@stores/ui";
import { BottomBar } from "./common/bottombar/BottomBar";

const SPA_TABS = [
  { id: "biomon", label: "BIOMON" },
  { id: "dossier", label: "DOSSIER" },
  { id: "equipment", label: "EQUIP" },
];

export const Charsheet = () => {
  const tab = useStore($spaTab);

  const spaClass = `charsheet-spa ${tab}-section}`;

  return (
    <div class={spaClass}>
      <div class="fixed-bar">
        <WoundTracker />
        <div class="secondary-bar flex-between">
          <StatsStrip />
          <BodyInfo />
        </div>
        <div class="tab-row">
          <TabStrip tabs={SPA_TABS} $store={$spaTab} class="spa-tabs" />
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
