import { useStore } from "@nanostores/preact";
import { lazy, Suspense } from "preact/compat";

import { tabStore } from "@stores/ui";

import { Panel } from "../shared";
import { TabStrip } from "../shared/TabStrip";
import { TwoPanelView } from "../shared/TwoPanelView";

import DefensePanel from "./defense/DefensePanel";

const RangedPanel = lazy(() => import("./offense/RangedPanel"));
const MeleePanel = lazy(() => import("./offense/MeleePanel"));

const $offenseTab = tabStore("offense-tab", "ranged");

const OFFENSE_TABS = [
  { id: "ranged", label: "Ranged" },
  { id: "melee", label: "Melee" },
];

export default function CombatView() {
  const offenseTab = useStore($offenseTab);

  return (
    <TwoPanelView
      renderFirst={(expanded, onToggle) => (
        <DefensePanel expanded={expanded} onToggle={onToggle} />
      )}
      renderSecond={(expanded, onToggle) => (
        <Panel
          id="combat-offense-panel"
          title="Offense"
          expanded={expanded}
          onToggle={onToggle}
          headerActions={<TabStrip tabs={OFFENSE_TABS} persist="offense-tab" />}
        >
          <Suspense fallback={null}>
            {offenseTab === "melee" ? <MeleePanel /> : <RangedPanel />}
          </Suspense>
        </Panel>
      )}
    />
  );
}
