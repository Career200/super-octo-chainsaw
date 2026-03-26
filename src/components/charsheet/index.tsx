import { useStore } from "@nanostores/preact";
import { Suspense } from "preact/compat";
import { useEffect, useState } from "preact/hooks";

import { tabStore } from "@stores/ui";

import { BottomBar } from "./common/bottombar/BottomBar";
import { BodyInfo } from "./common/topbar/BodyInfo";
import { StatsStrip } from "./common/topbar/StatsStrip";
import { ErrorBoundary } from "./ErrorBoundary";
import { TabStrip } from "./shared/TabStrip";
import { tracedLazy } from "./tracedLazy";

// Deferred
const WoundIndicator = tracedLazy("WoundIndicator", () => import("./common/topbar/WoundIndicator"));
const AwarenessLine = tracedLazy("AwarenessLine", () => import("./common/topbar/AwarenessLine"));

// Views
const CombatView = tracedLazy("CombatView", () => import("./combat/CombatView"));
const DossierView = tracedLazy("DossierView", () => import("./dossier/DossierView"));
const EquipmentView = tracedLazy("EquipmentView", () => import("./equipment/EquipmentView"));

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
      const t0 = performance.now();
      console.log("[idle] prefetch start");
      Promise.all([
        import("./combat/CombatView"),
        import("./dossier/DossierView"),
        import("./equipment/EquipmentView"),
        import("./equipment/armor/ArmorSubView"),
        import("./equipment/weapons/WeaponsSubView"),
        import("./equipment/gear/GearPanel"),
      ]).then(() => console.log(`[idle] prefetch done in ${(performance.now() - t0).toFixed(1)}ms`));
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
