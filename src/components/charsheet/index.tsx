import { useStore } from "@nanostores/preact";
import { lazy, Suspense } from "preact/compat";
import { useEffect, useState } from "preact/hooks";

import { tabStore } from "@stores/ui";

import { BodyInfo } from "./combat/BodyInfo";
import { StatsStrip } from "./combat/StatsStrip";
import { BottomBar } from "./common/bottombar/BottomBar";
import { ErrorBoundary } from "./ErrorBoundary";
import { TabStrip } from "./shared/TabStrip";

// Deferred
const WoundIndicator = lazy(() => import("./combat/WoundIndicator"));
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
  const tab = useStore(tabStore("spa-tab", "dossier"));
  const [idleReached, setIdleReached] = useState(false);

  useEffect(() => {
    const id = requestIdleCallback(() => {
      setIdleReached(true);
      import("./combat/CombatView");
      import("./dossier/DossierView");
      import("./equipment/EquipmentView");
    });
    return () => cancelIdleCallback(id);
  }, []);

  const spaClass = `charsheet-spa ${tab}-section`;

  return (
    <ErrorBoundary>
    <div class={spaClass}>
      <div class="fixed-bar">
        <div class="secondary-bar">
          <BodyInfo />
          {(tab === "combat" || idleReached) && (
            <Suspense fallback={null}>
              <WoundIndicator />
            </Suspense>
          )}
          <StatsStrip />
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
      <BottomBar />
    </div>
    </ErrorBoundary>
  );
};
