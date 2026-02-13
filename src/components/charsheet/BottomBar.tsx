import { useStore } from "@nanostores/preact";
import { $selectedSkill } from "@stores/ui";
import { $skills } from "@stores/skills";
import { STAT_LABELS } from "@scripts/biomon/types";

const STAT_DISPLAY: Record<string, string> = {
  ...STAT_LABELS,
  special: "SPECIAL",
};

export const BottomBar = () => {
  const skillName = useStore($selectedSkill);
  const skills = useStore($skills);

  const entry = skillName ? skills[skillName] : null;

  return (
    <div class="bottom-bar">
      {entry ? (
        <>
          <div class="bottom-bar-content">
            <span class="bottom-bar-name">{skillName}</span>
            <span class="bottom-bar-stat">
              {STAT_DISPLAY[entry.stat] ?? entry.stat}
              {entry.combat && " / COMBAT"}
            </span>
          </div>
          <button
            class="bottom-bar-close"
            onClick={() => $selectedSkill.set(null)}
            aria-label="Close"
          >
            &times;
          </button>
        </>
      ) : (
        <div class="bottom-bar-content">
          <span class="bottom-bar-hint">Select a skill</span>
        </div>
      )}
    </div>
  );
};
