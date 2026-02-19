import { useStore } from "@nanostores/preact";
import {
  $ownedArmor,
  getBodyPartLayers,
  getImplantsForPart,
  getArmorPiece,
  getTemplate,
  isSkinweave,
} from "@stores/armor";
import {
  getEffectiveSP,
  getImplantSP,
  getPartSpMax,
  sortByLayerOrder,
} from "@scripts/armor/core";
import { $selectedArmor, selectArmor, $highlightedPart, highlightPart } from "@stores/ui";
import { HelpPopover } from "../../shared/HelpPopover";
import { HitPopover } from "../HitPopover";
import { LayerBar } from "./LayerBar";

interface Props {
  mode?: "biomon" | "inventory";
}

export const FaceCard = ({ mode = "biomon" }: Props) => {
  useStore($ownedArmor);
  const selectedArmorId = useStore($selectedArmor);
  const highlightedPartVal = useStore($highlightedPart);

  const inventory = mode === "inventory";

  const layers = getBodyPartLayers("face");
  const implants = getImplantsForPart("face");
  const total = getEffectiveSP(layers, { implants, part: "face" });

  const selectedArmor =
    inventory && selectedArmorId
      ? (getArmorPiece(selectedArmorId) ?? getTemplate(selectedArmorId))
      : null;
  const isHighlighted =
    inventory &&
    (highlightedPartVal === "face" ||
      (selectedArmor?.bodyParts.includes("face") ?? false));

  const handleClick = () => {
    highlightPart(highlightedPartVal === "face" ? null : "face");
  };

  const handleLayerClick = (armorId: string) => {
    selectArmor(armorId);
  };

  const sources = [
    ...layers.map((l) => ({
      name: l.name,
      sp: l.spCurrent,
      max: getPartSpMax(l, "face"),
    })),
    ...implants
      .filter((i) => getImplantSP(i, "face") > 0)
      .map((i) => ({
        name: i.name,
        sp: getImplantSP(i, "face"),
        max: getPartSpMax(i, "face"),
      })),
  ];

  const cls = [
    "body-part",
    inventory && "body-part-clickable",
    isHighlighted && "body-part-highlighted",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      class={cls}
      id="part-face"
      onClick={inventory ? handleClick : undefined}
    >
      {!inventory && <HitPopover forPart="face">1 {">"} 1-4</HitPopover>}
      <h3>
        Face{" "}
        <span class="sp-value" id="sp-face">
          {total}
        </span>{" "}
        <HelpPopover
          id="face-help"
          content={
            <>
              <h3>Face Protection</h3>
              <section>
                <h4>Targeting</h4>
                <p>
                  On head hits, roll <strong>1d10</strong>: results{" "}
                  <strong>1-4</strong> hit the face, <strong>5-10</strong> hit
                  the head.
                </p>
              </section>
              <h4>Coverage</h4>
              <p>
                Hard helmets protect face at <strong>half SP</strong>. Faceplate
                and SkinWeave provide full SP.
              </p>
              {sources.length > 0 ? (
                <ul>
                  {sources.map((s) => (
                    <li key={s.name}>
                      {s.name}: {s.sp}/{s.max}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  <em>No face protection equipped.</em>
                </p>
              )}
            </>
          }
        />
      </h3>
      {inventory && (() => {
        const sorted = sortByLayerOrder(layers);
        const faceplate = implants.filter((i) => i.layer === "faceplate");
        const plating = implants.filter((i) => i.layer === "plating");
        const skinweave = implants.filter((i) => isSkinweave(i));
        const subdermal = implants.filter((i) => i.layer === "subdermal");
        return (
        <div class="layer-list" id="layers-face">
          {sorted.map((layer) => (
            <LayerBar
              key={layer.id}
              name={layer.shortName ?? layer.name}
              currentSP={layer.spCurrent}
              maxSP={getPartSpMax(layer, "face")}
              onClick={() => handleLayerClick(layer.id)}
              active={selectedArmorId === layer.id}
            />
          ))}
          {faceplate.map((impl) => (
            <LayerBar
              key={impl.id}
              name={impl.shortName ?? impl.name}
              currentSP={impl.spByPart.face ?? 0}
              maxSP={getPartSpMax(impl, "face")}
              className="layer-cyber"
            />
          ))}
          {plating.map((impl) => (
            <LayerBar
              key={impl.id}
              name={impl.shortName ?? impl.name}
              currentSP={impl.spByPart.face ?? 0}
              maxSP={getPartSpMax(impl, "face")}
              className="layer-cyber"
            />
          ))}
          {skinweave.map((impl) => (
            <LayerBar
              key={impl.id}
              name={impl.shortName ?? impl.name}
              currentSP={impl.spByPart.face ?? 0}
              maxSP={getPartSpMax(impl, "face")}
              className="layer-cyber"
            />
          ))}
          {subdermal.map((impl) => (
            <LayerBar
              key={impl.id}
              name={impl.shortName ?? impl.name}
              currentSP={impl.spByPart.face ?? 0}
              maxSP={getPartSpMax(impl, "face")}
              className="layer-cyber"
            />
          ))}
        </div>
        );
      })()}
    </div>
  );
};
