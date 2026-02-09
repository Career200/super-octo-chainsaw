import {
  getEffectiveSP,
  getImplantSP,
  sortByLayerOrder,
  type ArmorPiece,
  type BodyPartName,
} from "./core";
import {
  damageArmor,
  getBodyPartLayers,
  getImplantsForPart,
} from "../../stores/armor";
export type { DamageType } from "./damage-types";

export interface DamageResult {
  penetrating: number;
  degradation: Map<string, number>;
}

export interface DamageOptions {
  /** Scale degradation by damage over threshold. Default: true
   *  - true: soft loses 1 + floor(over/5), hard loses 1 + floor(over/6)
   *  - false: all layers lose exactly 1 SP (vanilla staged penetration) */
  scaledDegradation?: boolean;
  implants?: ArmorPiece[];
  part?: BodyPartName;
}

/**
 * Calculate damage penetration through layered armor.
 *
 * ARMOR MECHANICS:
 * - Protection uses EFFECTIVE SP (proportional armor bonus for layers)
 * - If damage ≤ effective SP: stopped, no degradation
 * - If damage > effective SP: penetrating damage to character, layers degrade
 *
 * DEGRADATION (when penetrated):
 * - All layers: base 1 SP loss
 * - scaledDegradation: true (default)
 *   - Top layer only: additional floor(over / 5) for soft, floor(over / 6) for hard
 *   - If top layer reduced to 0, excess cascades to next layer
 * - scaledDegradation: false (vanilla)
 *   - All layers lose exactly 1 SP
 *
 * NOTE: Armor health is tracked per-body-part. A jacket hit on the arm
 * doesn't degrade the torso protection.
 *
 * @param activeLayers - Pre-filtered (worn, spCurrent > 0) and sorted by spCurrent desc
 */
export function calculateDamage(
  activeLayers: ArmorPiece[],
  damage: number,
  options: DamageOptions = {},
): DamageResult {
  const { scaledDegradation = true, implants = [], part } = options;
  const degradation = new Map<string, number>();

  const hasAnyProtection =
    activeLayers.length > 0 || implants.some((i) => getImplantSP(i, part) > 0);

  if (!hasAnyProtection) {
    return { penetrating: damage, degradation };
  }

  const effectiveSP = getEffectiveSP(activeLayers, { implants, part });
  if (damage <= effectiveSP) {
    return { penetrating: 0, degradation };
  }

  const over = damage - effectiveSP;

  // All layers get base 1 degradation
  for (const layer of activeLayers) {
    degradation.set(layer.id, 1);
  }

  // Top layer gets additional scaled degradation, with cascade on overflow
  if (scaledDegradation && activeLayers.length > 0) {
    const topLayer = activeLayers[0];
    const divisor = topLayer.type === "soft" ? 5 : 6;
    const totalTopDeg = 1 + Math.floor(over / divisor);

    if (totalTopDeg <= topLayer.spCurrent) {
      degradation.set(topLayer.id, totalTopDeg);
    } else {
      // Overflow: cap top layer, cascade excess
      degradation.set(topLayer.id, topLayer.spCurrent);
      let leftover = totalTopDeg - topLayer.spCurrent;

      for (let i = 1; i < activeLayers.length && leftover > 0; i++) {
        const layer = activeLayers[i];
        const baseDeg = degradation.get(layer.id)!;
        const canAdd = Math.max(0, layer.spCurrent - baseDeg);
        const toAdd = Math.min(leftover, canAdd);
        degradation.set(layer.id, baseDeg + toAdd);
        leftover -= toAdd;
      }
    }
  }

  return { penetrating: over, degradation };
}

export function applyHit(bodyPart: BodyPartName, damage: number): DamageResult {
  const layers = getBodyPartLayers(bodyPart);
  // getBodyPartLayers already returns only worn armor, just filter for active SP
  const activeBefore = sortByLayerOrder(layers.filter((l) => l.spCurrent > 0));
  const implants = getImplantsForPart(bodyPart);

  const result = calculateDamage(activeBefore, damage, {
    implants,
    part: bodyPart,
  });

  // Apply degradation to each armor piece at this specific body part
  for (const [armorId, amount] of result.degradation) {
    damageArmor(armorId, bodyPart, amount);
  }

  // When penetrated, damage all implant layers (plating, skinweave, subdermal)
  // Each layer takes 1 damage when penetrated
  if (result.penetrating > 0) {
    for (const impl of implants) {
      if (getImplantSP(impl, bodyPart) > 0) {
        damageArmor(impl.id, bodyPart, 1);
      }
    }
  }

  // Check for layer flip (top layer changed)
  const wornBefore = activeBefore.map((l) => ({
    id: l.id,
    name: l.name,
    sp: l.spCurrent,
  }));

  const wornAfter = activeBefore
    .map((l) => ({
      id: l.id,
      name: l.name,
      sp: l.spCurrent - (result.degradation.get(l.id) ?? 0),
    }))
    .filter((l) => l.sp > 0)
    .sort((a, b) => b.sp - a.sp);

  const topWornBefore = wornBefore[0];
  const topWornAfter = wornAfter[0];

  // Log layer flip for awareness
  if (topWornBefore && topWornAfter && topWornBefore.id !== topWornAfter.id) {
    console.warn(
      `⚠️ ${topWornBefore.name} shredded — ${topWornAfter.name} taking point`, // TODO: restore info popup, console is irrelevant for an actual user
    );
  } else if (topWornBefore && !topWornAfter) {
    const implantAfter = implants
      .map((i) => ({
        id: i.id,
        name: i.name,
        sp: getImplantSP(i, bodyPart) - (result.penetrating > 0 ? 1 : 0),
      }))
      .filter((l) => l.sp > 0)
      .sort((a, b) => b.sp - a.sp)[0];

    if (implantAfter) {
      console.warn(
        `⚠️ ${topWornBefore.name} shredded — ${implantAfter.name} taking point`, // TODO: restore info popup, console is irrelevant for an actual user
      );
    }
  }

  return result;
}
