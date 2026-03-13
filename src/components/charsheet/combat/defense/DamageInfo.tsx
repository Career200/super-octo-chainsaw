import { useStore } from "@nanostores/preact";

import { $bodyType } from "@stores/stats";

export const DamageInfo = () => {
  const body = useStore($bodyType);
  const showDeathSave = body.deathSave !== null && !body.stabilized;

  return (
    <div class="damage-info">
      <div class="label-chip">
        <span class="label-chip-label">BTM</span>
        <span class="label-chip-value">{body.btm}</span>
      </div>
      <div class="label-chip body-save">
        <span class="label-chip-label">Save</span>
        <span class="label-chip-value">{body.currentSave}</span>
        <span
          class={`save-penalty${body.savePenalty < 0 ? " has-penalty" : ""}`}
        >
          {body.savePenalty < 0 && `(${body.savePenalty})`}
        </span>
        {showDeathSave && (
          <>
            <span class="label-chip-label"> Death</span>
            <span class="label-chip-value death-save">{body.deathSave}</span>
          </>
        )}
      </div>
    </div>
  );
};
