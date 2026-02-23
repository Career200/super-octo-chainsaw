import { useStore } from "@nanostores/preact";
import { lazy, Suspense } from "preact/compat";

import { tabStore } from "@stores/ui";

import { BottomBar } from "./common/bottombar/BottomBar";
import { TabStrip } from "./shared/TabStrip";

// Fixed bar components (defer stats/health/skills/armor store chains)
const WoundTracker = lazy(() => import("./combat/WoundTracker"));
const StatsStrip = lazy(() => import("./combat/StatsStrip"));
const BodyInfo = lazy(() => import("./combat/BodyInfo"));
const AwarenessLine = lazy(() => import("./combat/AwarenessLine"));

// Views
const CombatView = lazy(() => import("./combat/CombatView"));
const DossierView = lazy(() => import("./dossier/DossierView"));
const EquipmentView = lazy(() => import("./equipment/EquipmentView"));

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
        <Suspense fallback={<div class="bar-loading" />}>
          <WoundTracker />
          <div class="secondary-bar flex-between">
            <StatsStrip />
            <BodyInfo />
          </div>
        </Suspense>
        <div class="tab-row">
          <TabStrip tabs={SPA_TABS} persist="spa-tab" class="spa-tabs" />
          <Suspense fallback={null}>
            <AwarenessLine />
          </Suspense>
        </div>
      </div>
      <Suspense fallback={<div class="loading-fallback">Loading</div>}>
        {tab === "combat" && <CombatView />}
        {tab === "dossier" && <DossierView />}
        {tab === "equipment" && <EquipmentView />}
      </Suspense>
      <BottomBar />
    </div>
  );
};
