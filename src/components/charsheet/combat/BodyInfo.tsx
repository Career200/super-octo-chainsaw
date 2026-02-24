import { useStore } from "@nanostores/preact";

import { $bodyType } from "@stores/stats";

export default function BodyInfo() {
  const body = useStore($bodyType);

  return (
    <div class="body-info" id="body-info">
      <div class="label-chip body-type">
        <span class="body-type-name">{body.name}</span>
      </div>
      <div class="label-chip">
        <span class="label-chip-label">Carry</span>
        <span class="carry-value">{body.carry}kg</span>
        <span class="label-chip-label"> Lift</span>
        <span class="carry-value">{body.deadlift}kg</span>
      </div>
    </div>
  );
}
