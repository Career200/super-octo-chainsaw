import { useStore } from "@nanostores/preact";
import { useMemo } from "preact/hooks";

import { getTemplate } from "@scripts/armor/catalog";
import { checkLayerFit } from "@scripts/armor/core";
import { CYBER_CATALOG, type CyberTemplate } from "@scripts/cyber/catalog";
import { $armorEffects } from "@stores/armor/effects";
import { $ownedCyber } from "@stores/cyber";

export function useCyberArmorBlockedHint(template: CyberTemplate | null): string | undefined {
  const effects = useStore($armorEffects);
  const cyberItems = useStore($ownedCyber);

  return useMemo(() => {
    if (!template?.armorTemplateId) return undefined;

    const armorTpl = getTemplate(template.armorTemplateId);
    if (!armorTpl) return "Unknown armor template";

    // For skinweave: swap is allowed (replaces existing), so no layer fit check
    if (template.skinweave) return undefined;

    // For non-skinweave: check layer constraints
    const fit = checkLayerFit(
      armorTpl.bodyParts,
      armorTpl.type,
      armorTpl.layer,
      effects.layersByPart,
    );
    if (!fit.ok) return fit.reason;

    // Check if already installed (same armorTemplateId)
    const alreadyInstalled = cyberItems.some(
      (i) =>
        i.installed &&
        CYBER_CATALOG[i.templateId]?.armorTemplateId === template.armorTemplateId,
    );
    if (alreadyInstalled) return "Already installed";

    return undefined;
  }, [template, effects, cyberItems]);
}

export function useSkinweaveSwapWarning(template: CyberTemplate | null): string | undefined {
  const cyberItems = useStore($ownedCyber);

  return useMemo(() => {
    if (!template?.skinweave) return undefined;

    const existing = cyberItems.find(
      (i) => i.installed && CYBER_CATALOG[i.templateId]?.skinweave === true,
    );
    if (!existing) return undefined;

    const existingName = CYBER_CATALOG[existing.templateId]?.name ?? "current skinweave";
    return `Will replace ${existingName}`;
  }, [template, cyberItems]);
}
