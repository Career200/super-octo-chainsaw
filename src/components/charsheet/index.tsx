import { useStore } from "@nanostores/preact";
import { lazy, Suspense } from "preact/compat";

import { tabStore } from "@stores/ui";

import { TabStrip } from "./shared/TabStrip";

// Fixed bar components (defer stats/health/skills/armor store chains)
const WoundTracker = lazy(() =>
  import("./combat/WoundTracker").then((m) => ({ default: m.WoundTracker })),
);
const StatsStrip = lazy(() =>
  import("./combat/StatsStrip").then((m) => ({ default: m.StatsStrip })),
);
const BodyInfo = lazy(() =>
  import("./combat/BodyInfo").then((m) => ({ default: m.BodyInfo })),
);
const AwarenessLine = lazy(() =>
  import("./combat/AwarenessLine").then((m) => ({
    default: m.AwarenessLine,
  })),
);

// Views
const CombatView = lazy(() =>
  import("./combat").then((m) => ({ default: m.CombatView })),
);
const DossierView = lazy(() =>
  import("./dossier/DossierView").then((m) => ({ default: m.DossierView })),
);
const EquipmentView = lazy(() =>
  import("./equipment/EquipmentView").then((m) => ({
    default: m.EquipmentView,
  })),
);

// Bottom bar
const BottomBar = lazy(() =>
  import("./common/bottombar/BottomBar").then((m) => ({
    default: m.BottomBar,
  })),
);

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
        <Suspense fallback={null}>
          <WoundTracker />
        </Suspense>
        <div class="secondary-bar flex-between">
          <Suspense fallback={null}>
            <StatsStrip />
            <BodyInfo />
          </Suspense>
        </div>
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
      <Suspense fallback={null}>
        <BottomBar />
      </Suspense>
    </div>
  );
};
