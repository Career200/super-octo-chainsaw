import { useStore } from "@nanostores/preact";
import { Suspense } from "preact/compat";

import { tabStore } from "@stores/ui";

import { BottomBar } from "./common/bottombar/BottomBar";
import { lazyNamed } from "./shared";
import { TabStrip } from "./shared/TabStrip";
// Fixed bar components (defer stats/health/skills/armor store chains)
const WoundTracker = lazyNamed(
  () => import("./combat/WoundTracker"),
  "WoundTracker",
);
const StatsStrip = lazyNamed(() => import("./combat/StatsStrip"), "StatsStrip");
const BodyInfo = lazyNamed(() => import("./combat/BodyInfo"), "BodyInfo");
const AwarenessLine = lazyNamed(
  () => import("./combat/AwarenessLine"),
  "AwarenessLine",
);

// Views
const CombatView = lazyNamed(() => import("./combat"), "CombatView");
const DossierView = lazyNamed(
  () => import("./dossier/DossierView"),
  "DossierView",
);
const EquipmentView = lazyNamed(
  () => import("./equipment/EquipmentView"),
  "EquipmentView",
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
