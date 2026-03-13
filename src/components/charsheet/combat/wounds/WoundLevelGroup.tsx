import {
  BOXES_PER_LEVEL,
  WOUND_LEVEL_NAMES,
  type WoundLevel,
} from "@scripts/combat/types";
import { $health, setDamage } from "@stores/health";

import { WoundBox } from "./WoundBox";

interface Props {
  level: WoundLevel;
  levelIndex: number;
  physical: number;
  stun: number;
  showStun: boolean;
}

export const WoundLevelGroup = ({
  level,
  levelIndex,
  physical,
  stun,
  showStun,
}: Props) => {
  const startBox = levelIndex * BOXES_PER_LEVEL;
  const endBox = startBox + BOXES_PER_LEVEL;
  const boxes = Array.from(
    { length: BOXES_PER_LEVEL },
    (_, i) => startBox + i + 1,
  );

  const handleLabelClick = (e: MouseEvent) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (e.target.closest(".wound-track")) return;

    const state = $health.get();
    const syncStun = !showStun;
    if (state.physical === endBox) {
      setDamage(startBox, "physical", syncStun);
    } else {
      setDamage(endBox, "physical", syncStun);
    }
  };

  return (
    <div class="wound-level-group" onClick={handleLabelClick}>
      <div class="wound-level-label">{WOUND_LEVEL_NAMES[level]}</div>
      <div class="wound-boxes">
        <div class="wound-track wound-track-physical">
          {boxes.map((index) => (
            <WoundBox
              key={`physical-${index}`}
              index={index}
              type="physical"
              filled={physical >= index}
              showStun={showStun}
            />
          ))}
        </div>
        <div class="wound-track wound-track-stun">
          {boxes.map((index) => (
            <WoundBox
              key={`stun-${index}`}
              index={index}
              type="stun"
              filled={stun >= index}
              showStun={showStun}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
