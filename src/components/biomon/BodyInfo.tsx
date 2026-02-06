import { useStore } from "@nanostores/preact";
import { $bodyType } from "@stores/stats";
import { HelpPopover } from "@components/shared/HelpPopover";
import { BodyHelpContent } from "@components/shared/help/biomon/BodyHelpContent";

export const BodyInfo = () => {
  const body = useStore($bodyType);

  return (
    <div class="body-info" id="body-info">
      <HelpPopover id="body-help" content={<BodyHelpContent />} />
      <div class="body-stat">
        <span class="body-label">BT</span>
        <span class="body-stat-value">{body.value}</span>
      </div>
      <div class="body-stat body-type">
        <span class="body-type-name">{body.name}</span>
      </div>
      <div class="body-stat">
        <span class="body-label">Carry</span>
        <span class="carry-value">{body.carry}kg</span>
        <span class="body-label"> Lift</span>
        <span class="carry-value">{body.deadlift}kg</span>
      </div>
      <div class="body-stat">
        <span class="body-label">BTM</span>
        <span class="btm-value">{body.btm}</span>
      </div>
      <div class="body-stat body-save">
        <span class="body-label">Save</span>
        <span class="save-value">{body.currentSave}</span>
        <span class={`save-penalty${body.savePenalty < 0 ? " has-penalty" : ""}`}>
          {body.savePenalty < 0 && `(${body.savePenalty})`}
        </span>
      </div>
    </div>
  );
};
