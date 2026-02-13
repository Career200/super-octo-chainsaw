import { useStore } from "@nanostores/preact";
import {
  $ownedArmor,
  getBodyPartLayers,
  getImplantsForPart,
  isSkinweave,
} from "@stores/armor";
import { getImplantSP, proportionalArmorBonus } from "@scripts/armor/core";
import { HelpPopover } from "../../shared/HelpPopover";
import { FaceHelpContent } from "../help/FaceHelpContent";

interface FaceLayer {
  name: string;
  sp: number;
}

function getFaceLayers(): FaceLayer[] {
  const headLayers = getBodyPartLayers("head");
  const implants = getImplantsForPart("head");
  const layers: FaceLayer[] = [];

  for (const layer of headLayers) {
    if (layer.type === "hard") {
      const sp = Math.floor(layer.spCurrent / 2);
      if (sp > 0) {
        layers.push({ name: `${layer.name} (½)`, sp });
      }
    }
  }

  const faceplate = implants.find((i) => i.layer === "faceplate");
  if (faceplate) {
    const sp = faceplate.spByPart["head"] ?? 0;
    if (sp > 0) {
      layers.push({ name: faceplate.name, sp });
    }
  }

  const skinweave = implants.find((i) => isSkinweave(i));
  if (skinweave) {
    const sp = getImplantSP(skinweave, "head");
    if (sp > 0) {
      layers.push({ name: "SkinWeave", sp });
    }
  }

  return layers;
}

function calculateFaceSP(layers: FaceLayer[]): number {
  if (layers.length === 0) return 0;

  const sorted = [...layers].sort((a, b) => b.sp - a.sp);
  let effectiveSP = sorted[0].sp;

  for (let i = 1; i < sorted.length; i++) {
    const layerSP = sorted[i].sp;
    const diff = effectiveSP - layerSP;
    const bonus = Math.min(layerSP, proportionalArmorBonus(diff));
    effectiveSP += bonus;
  }

  return effectiveSP;
}

export const FaceCard = () => {
  useStore($ownedArmor);

  const layers = getFaceLayers();
  const total = calculateFaceSP(layers);

  return (
    <div class="body-part" id="part-face">
      <h3>
        Face <HelpPopover id="face-help" content={<FaceHelpContent layers={layers} />} />
      </h3>
      SP: <span class="sp-value" id="sp-face">{total}</span>
    </div>
  );
};
