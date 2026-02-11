import { useStore } from "@nanostores/preact";
import { useState, useEffect } from "preact/hooks";
import { $health, syncStunToPhysical } from "@stores/health";
import { WOUND_LEVELS } from "@scripts/biomon/types";
import { WoundLevelGroup } from "./WoundLevelGroup";
import { StabilizedControl } from "./StabilizedControl";
import { HelpPopover } from "@components/shared/HelpPopover";
import { WoundHelpContent } from "@components/shared/help/biomon/WoundHelpContent";

export const WoundTracker = () => {
  const health = useStore($health);
  const [showStun, setShowStun] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

  const handleBarClick = (e: MouseEvent) => {
    if (window.innerWidth > 1024) return; // not collapsible on desktop
    const target = e.target as HTMLElement;
    if (
      target.closest(
        "button, a, input, [popover], .help-trigger, [role=checkbox]",
      )
    )
      return;
    setCollapsed(!collapsed);
  };

  return (
    <div
      class={`wound-bar${collapsed ? " wound-collapsed" : ""}`}
      onClick={handleBarClick}
    >
      <div class="wound-bar-header">
        <span class="wound-bar-title">
          Wounds <HelpPopover id="wound-help" content={<WoundHelpContent />} />
        </span>
        <div class="wound-bar-controls">
          <button
            class={`btn-ghost ${showStun ? "active" : ""}`}
            onClick={handleStunToggle}
          >
            Stun
          </button>
          <StabilizedControl />
          <span class="wound-collapse-chevron">
            {collapsed ? "\u25BE" : "\u25B4"}
          </span>
        </div>
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
};
