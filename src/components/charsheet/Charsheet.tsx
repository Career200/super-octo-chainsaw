import { useStore } from "@nanostores/preact";
import { Biomonitor } from "../biomon";
import { ArmorView } from "./ArmorView";
import { StatsSkillsPanel } from "./StatsSkillsPanel";
import { NotesPanel } from "./NotesPanel";
import { TabStrip } from "../shared/TabStrip";
import { WoundTracker } from "../biomon/WoundTracker";
import { BodyInfo } from "../biomon/BodyInfo";
// import { HitLocationTable } from "../biomon/HitLocationTable";
import { StatsStrip } from "../biomon/StatsStrip";
import { AwarenessLine } from "../biomon/AwarenessLine";
import { $spaTab } from "@stores/ui";

const SPA_TABS = [
  { id: "biomon", label: "BIOMON" },
  { id: "rp", label: "RP" },
  { id: "armor", label: "ARMOR" },
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
      {tab === "rp" && (
        <div class="container">
          <StatsSkillsPanel />
          <NotesPanel />
        </div>
      )}
      {tab === "armor" && <ArmorView />}
    </div>
  );
};
