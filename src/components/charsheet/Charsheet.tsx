import { useStore } from "@nanostores/preact";
import { Biomonitor } from "../biomon";
import { ArmorView } from "./ArmorView";
import { TabStrip } from "../shared/TabStrip";
import { WoundTracker } from "../biomon/WoundTracker";
import { BodyInfo } from "../biomon/BodyInfo";
import { HitLocationTable } from "../biomon/HitLocationTable";
import { $spaTab } from "@stores/ui";

const SPA_TABS = [
  { id: "biomon", label: "BIOMON" },
  { id: "armor", label: "ARMOR" },
];

export const Charsheet = () => {
  const tab = useStore($spaTab);

  return (
    <div class={`charsheet-spa ${tab}-section`}>
      <div class="fixed-bar">
        <WoundTracker />
        <div class="secondary-bar flex-between">
          <BodyInfo />
          <HitLocationTable />
        </div>
        <TabStrip tabs={SPA_TABS} $store={$spaTab} class="spa-tabs" />
      </div>
      {tab === "biomon" ? <Biomonitor /> : <ArmorView />}
    </div>
  );
};
