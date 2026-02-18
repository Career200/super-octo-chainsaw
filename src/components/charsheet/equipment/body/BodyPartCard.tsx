import { useStore } from "@nanostores/preact";
import {
  $ownedArmor,
  getBodyPartLayers,
  getImplantsForPart,
  isSkinweave,
} from "@stores/armor";
import {
  getEffectiveSP,
  sortByLayerOrder,
  PART_NAMES,
  type BodyPartName,
} from "@scripts/armor/core";
import { LayerBar } from "./LayerBar";
import { HitPopover } from "../HitPopover";

const HIT_ROLL: Record<string, string> = {
  head: "1",
  torso: "2-4",
  right_arm: "5",
  left_arm: "6",
  right_leg: "7-8",
  left_leg: "9-0",
};

interface Props {
  part: BodyPartName;
}

export const BodyPartCard = ({ part }: Props) => {
  useStore($ownedArmor);

  const layers = getBodyPartLayers(part);
  const implants = getImplantsForPart(part);

  const total = getEffectiveSP(layers, { implants, part });

  const sorted = sortByLayerOrder(layers);
  const plating = implants.filter((i) => i.layer === "plating");
  const skinweave = implants.filter((i) => isSkinweave(i));
  const subdermal = implants.filter((i) => i.layer === "subdermal");

  return (
    <div class="body-part" id={`part-${part}`}>
      <HitPopover forPart={part}>{HIT_ROLL[part]}</HitPopover>
      <h3>
        {PART_NAMES[part]} <span class="sp-total">{total}</span>
      </h3>
      <div class="layer-list" id={`layers-${part}`}>
        {sorted.map((layer) => (
          <LayerBar
            key={layer.id}
            name={layer.shortName ?? layer.name}
            currentSP={layer.spCurrent}
            maxSP={layer.spMax}
          />
        ))}
        {plating.map((impl) => (
          <LayerBar
            key={impl.id}
            name={impl.shortName ?? impl.name}
            currentSP={impl.spByPart[part] ?? 0}
            maxSP={impl.spMax}
            className="layer-skinweave"
          />
        ))}
        {skinweave.map((impl) => (
          <LayerBar
            key={impl.id}
            name={impl.shortName ?? impl.name}
            currentSP={impl.spByPart[part] ?? 0}
            maxSP={impl.spMax}
            className="layer-skinweave"
          />
        ))}
        {subdermal.map((impl) => (
          <LayerBar
            key={impl.id}
            name={impl.shortName ?? impl.name}
            currentSP={impl.spByPart[part] ?? 0}
            maxSP={impl.spMax}
            className="layer-skinweave"
          />
        ))}
      </div>
    </div>
  );
};
