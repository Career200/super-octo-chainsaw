import { useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { Biomonitor } from "../biomon";
import { ArmorView } from "./ArmorView";
import { SkillsPanel } from "./SkillsPanel";
import { TabStrip } from "../shared/TabStrip";
import { WoundTracker } from "../biomon/WoundTracker";
import { BodyInfo } from "../biomon/BodyInfo";
// import { HitLocationTable } from "../biomon/HitLocationTable";
import { StatsStrip } from "../biomon/StatsStrip";
import { StatsPanel } from "../biomon/StatsPanel";
import { AwarenessLine } from "../biomon/AwarenessLine";
import { $spaTab } from "@stores/ui";

const SPA_TABS = [
  { id: "biomon", label: "BIOMON" },
  { id: "rp", label: "RP" },
  { id: "armor", label: "ARMOR" },
];

export const Charsheet = () => {
  const tab = useStore($spaTab);
  const [statsExpanded, setStatsExpanded] = useState(false);

  return (
    <div class={`charsheet-spa ${tab}-section`}>
      <div class="fixed-bar">
        <WoundTracker />
        <div class="secondary-bar flex-between">
          <StatsStrip
            expanded={statsExpanded}
            onToggle={() => setStatsExpanded(!statsExpanded)}
          />
          <BodyInfo />
        </div>
        {statsExpanded && (
          <div class="stats-strip-expanded">
            <StatsPanel />
          </div>
        )}
        <div class="tab-row">
          <TabStrip tabs={SPA_TABS} $store={$spaTab} class="spa-tabs" />
          <AwarenessLine />
        </div>
      </div>
      {tab === "biomon" && <Biomonitor />}
      {tab === "rp" && (
        <div class="container">
          <SkillsPanel />
        </div>
      )}
      {tab === "armor" && <ArmorView />}
    </div>
  );
};
