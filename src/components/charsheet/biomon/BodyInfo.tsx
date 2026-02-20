import { useStore } from "@nanostores/preact";

import { $bodyType } from "@stores/stats";

import { HelpPopover } from "../shared/HelpPopover";

import { BodyHelpContent } from "./help/BodyHelpContent";

export const BodyInfo = () => {
  const body = useStore($bodyType);
  const showDeathSave = body.deathSave !== null && !body.stabilized;

  return (
    <div class="body-info" id="body-info">
      <div class="label-chip">
        <span class="label-chip-label">BT</span>
        <span class="label-chip-value">{body.value}</span>
      </div>
      <div class="label-chip body-type">
        <span class="body-type-name">{body.name}</span>
      </div>
      <div class="label-chip">
        <span class="label-chip-label">Carry</span>
        <span class="carry-value">{body.carry}kg</span>
        <span class="label-chip-label"> Lift</span>
        <span class="carry-value">{body.deadlift}kg</span>
      </div>
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
      <HelpPopover id="body-help" content={<BodyHelpContent />} />
    </div>
  );
};
