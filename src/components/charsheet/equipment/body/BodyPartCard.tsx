import { useStore } from "@nanostores/preact";
import {
  $ownedArmor,
  getBodyPartLayers,
  getImplantsForPart,
  isSkinweave,
} from "@stores/armor";
import {
  getEffectiveSP,
  getImplantSP,
  sortByLayerOrder,
  PART_NAMES,
  type BodyPartName,
} from "@scripts/armor/core";
import { LayerBar } from "./LayerBar";

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

  const activeImplants = [...plating, ...skinweave, ...subdermal].filter(
    (i) => getImplantSP(i, part) > 0,
  );

  const spParts = [
    ...sorted.map((l) => l.spCurrent),
    ...activeImplants.map((i) => getImplantSP(i, part)),
  ];
  const breakdown = spParts.length > 1 ? ` = ${spParts.join(" + ")}` : null;

  return (
    <div class="body-part" id={`part-${part}`}>
      <h3>{PART_NAMES[part]}</h3>
      SP:{" "}
      <span class="sp-value" id={`sp-${part}`}>
        <span class="sp-total">{total}</span>
        {breakdown && <span class="sp-breakdown">{breakdown}</span>}
      </span>
      <div class="layer-list" id={`layers-${part}`}>
        {sorted.map((layer) => (
          <LayerBar
            key={layer.id}
            name={layer.name}
            currentSP={layer.spCurrent}
            maxSP={layer.spMax}
          />
        ))}
        {plating.map((impl) => (
          <LayerBar
            key={impl.id}
            name={impl.name}
            currentSP={impl.spByPart[part] ?? 0}
            maxSP={impl.spMax}
            className="layer-skinweave"
          />
        ))}
        {skinweave.map((impl) => (
          <LayerBar
            key={impl.id}
            name="SkinWeave"
            currentSP={impl.spByPart[part] ?? 0}
            maxSP={impl.spMax}
            className="layer-skinweave"
          />
        ))}
        {subdermal.map((impl) => (
          <LayerBar
            key={impl.id}
            name={impl.name}
            currentSP={impl.spByPart[part] ?? 0}
            maxSP={impl.spMax}
            className="layer-skinweave"
          />
        ))}
      </div>
    </div>
  );
};
