import { useStore } from "@nanostores/preact";
import { useEffect, useState } from "preact/hooks";

import { WOUND_LEVELS } from "@scripts/combat/types";
import { $health, syncStunToPhysical } from "@stores/health";

import { StabilizedControl } from "./StabilizedControl";
import { WoundLevelGroup } from "./WoundLevelGroup";

export default function WoundTracker() {
  const health = useStore($health);
  const [showStun, setShowStun] = useState(false);

  useEffect(() => {
    if (health.stun !== health.physical) {
      setShowStun(true);
    }
  }, [health.stun, health.physical]);

  const handleStunToggle = () => {
    const newShowStun = !showStun;
    setShowStun(newShowStun);
    if (!newShowStun) {
      syncStunToPhysical();
    }
  };

  return (
    <div class="wound-column">
      <div class="wound-column-controls">
        <div
          class={`stun-control${showStun ? " active" : ""}`}
          onClick={handleStunToggle}
        >
          <div class={`wound-box${showStun ? " filled" : ""}`} role="checkbox" />
          <span class="stun-label">Stun</span>
        </div>
        <StabilizedControl />
      </div>
      <div id="wound-tracker" class={showStun ? "show-stun" : ""}>
        {WOUND_LEVELS.map((level, index) => (
          <WoundLevelGroup
            key={level}
            level={level}
            levelIndex={index}
            physical={health.physical}
            stun={health.stun}
            showStun={showStun}
          />
        ))}
      </div>
    </div>
  );
}
