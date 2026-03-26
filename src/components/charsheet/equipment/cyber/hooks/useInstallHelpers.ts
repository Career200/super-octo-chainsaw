import { useStore } from "@nanostores/preact";
import { useMemo } from "preact/hooks";

import { CYBER_CATALOG } from "@scripts/cyber/catalog";
import { $hydratedCyber, $ownedCyber, getContainersForOption } from "@stores/cyber";
import { $homerules } from "@stores/homerules";

// --- Resolve effective HC notation (respects tsmFreeHc houserule) ---

const TSM_IDS = ["tsm", "tsm-plus"];

export function useEffectiveHc(
  templateId: string | undefined,
  rawHc: string,
): string {
  const rules = useStore($homerules);
  if (rules.tsmFreeHc && templateId && TSM_IDS.includes(templateId)) return "0";
  return rawHc;
}

// --- Build container choices for an option ---

export interface ContainerChoice {
  instanceId: string;
  label: string;
  installed: boolean;
  full: boolean;
}

export function useContainerChoices(
  templateId: string | undefined,
): ContainerChoice[] {
  const hydrated = useStore($hydratedCyber);
  return useMemo(() => {
    if (!templateId) return [];
    const available = getContainersForOption(templateId);
    // Count per-template for numbering
    const counts: Record<string, number> = {};
    const total: Record<string, number> = {};
    for (const { container } of available) {
      total[container.templateId] = (total[container.templateId] ?? 0) + 1;
    }
    return available.map(({ container, full }) => {
      const n = (counts[container.templateId] =
        (counts[container.templateId] ?? 0) + 1);
      const needsNumber = total[container.templateId] > 1;
      return {
        instanceId: container.instanceId,
        label: container.template.name + (needsNumber ? ` #${n}` : ""),
        installed: container.installed,
        full,
      };
    });
  }, [templateId, hydrated]);
}

// --- Get children of a container for multi-row HC ---

export function getChildHcRows(
  containerId: string,
): { key: string; name: string; notation: string }[] {
  const items = $ownedCyber.get();
  return items
    .filter((i) => i.parentId === containerId)
    .flatMap((i) => {
      const t = CYBER_CATALOG[i.templateId];
      if (!t) return [];
      return [{ key: i.instanceId, name: t.name, notation: t.hc }];
    });
}
