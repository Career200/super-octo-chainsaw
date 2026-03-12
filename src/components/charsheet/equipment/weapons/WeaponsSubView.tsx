import { TwoPanelView } from "@components/charsheet/shared/TwoPanelView";

import { AmmoListPanel } from "./AmmoListPanel";
import { WeaponListPanel } from "./WeaponListPanel";

export default function WeaponsSubView() {
  return (
    <TwoPanelView
      renderFirst={(expanded, onToggle) => (
        <WeaponListPanel expanded={expanded} onToggle={onToggle} />
      )}
      renderSecond={(expanded, onToggle) => (
        <AmmoListPanel expanded={expanded} onToggle={onToggle} />
      )}
    />
  );
}
