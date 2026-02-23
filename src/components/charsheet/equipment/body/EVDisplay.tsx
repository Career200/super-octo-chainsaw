import { useStore } from "@nanostores/preact";

import { PART_NAMES } from "@scripts/armor/core";
import { $encumbrance } from "@stores/armor";

export const EVDisplay = () => {
  const { ev, maxLayers, maxLocation } = useStore($encumbrance);

  return (
    <div
      class={`display-box ev-display${ev > 0 ? " has-penalty" : ""}`}
      id="ev-display"
    >
      <span class="text-label-lg ev-label">EV</span>
      <span class="text-value-2xl ev-value" id="ev-value">
        {ev > 0 ? `-${ev}` : "0"}
      </span>
      {maxLayers >= 2 && maxLocation && (
        <div class="ev-layer-penalty">
          layering penalty — {PART_NAMES[maxLocation]}
        </div>
      )}
    </div>
  );
};
