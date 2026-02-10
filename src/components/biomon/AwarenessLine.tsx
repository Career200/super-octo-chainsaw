import { useStore } from "@nanostores/preact";
import { $awareness } from "@stores/skills";

export const AwarenessLine = () => {
  const aw = useStore($awareness);

  return (
    <div class="awareness-line">
      <span class="awareness-label">Aw</span>
      <span class="awareness-totals">
        <span class="awareness-total">{aw.total}</span>
        <span class="awareness-separator">/</span>
        <span class="awareness-total-combat">{aw.totalCombat}</span>
      </span>
      <span class="awareness-breakdown">
        <span class="awareness-part awareness-int">INT {aw.int}</span>
        {" + "}
        <span class="awareness-part">Aw/N {aw.awarenessNotice}</span>
        <span class="awareness-part awareness-combat">
          {" (+ CS "}
          {aw.combatSense}
          {")"}
        </span>
      </span>
    </div>
  );
};
