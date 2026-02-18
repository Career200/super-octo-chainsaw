import { useStore } from "@nanostores/preact";
import {
  $ownedArmor,
  getBodyPartLayers,
  getImplantsForPart,
} from "@stores/armor";
import {
  getEffectiveSP,
  getImplantSP,
  getPartSpMax,
} from "@scripts/armor/core";
import { HelpPopover } from "../../shared/HelpPopover";
import { HitPopover } from "../HitPopover";

export const FaceCard = () => {
  useStore($ownedArmor);

  const layers = getBodyPartLayers("face");
  const implants = getImplantsForPart("face");
  const total = getEffectiveSP(layers, { implants, part: "face" });

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

  return (
    <div class="body-part" id="part-face">
      <HitPopover forPart="face">1 {">"} 1-4</HitPopover>
      <h3>
        Face{" "}
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
      SP:{" "}
      <span class="sp-value" id="sp-face">
        {total}
      </span>
    </div>
  );
};
