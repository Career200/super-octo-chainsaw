import { useStore } from "@nanostores/preact";
import { Biomonitor } from "../biomon";
import { ArmorView } from "./ArmorView";
import { TabStrip } from "../shared/TabStrip";
import { $spaTab } from "@stores/ui";

const SPA_TABS = [
  { id: "biomon", label: "BIOMON" },
  { id: "armor", label: "ARMOR" },
];

const SPA_COMPONENTS = {
  biomon: Biomonitor,
  armor: ArmorView,
};

export const Charsheet = () => {
  const tab = useStore($spaTab);

  return (
    <div class={`charsheet-spa ${tab}-section`}>
      <TabStrip tabs={SPA_TABS} $store={$spaTab} />
      {SPA_COMPONENTS[tab] && SPA_COMPONENTS[tab]()}
    </div>
  );
};
