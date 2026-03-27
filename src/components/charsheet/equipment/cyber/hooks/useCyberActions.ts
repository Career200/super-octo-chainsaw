import { useMemo } from "preact/hooks";

import { CATEGORY_LABELS, type CyberTemplate } from "@scripts/cyber/catalog";
import {
  canInstallContainer,
  canInstallTemplate,
  discardCyber,
  getChildHcRows,
  type HydratedCyberItem,
  installCyber,
  installOwned,
  slotOption,
  takeCyber,
  uninstallCyber,
  unslotOption,
} from "@stores/cyber";
import { selectCyber } from "@stores/ui";

import { useCyberArmorBlockedHint, useSkinweaveSwapWarning } from "./useCyberArmorHints";
import {
  type ContainerChoice,
  useContainerChoices,
  useEffectiveHc,
} from "./useInstallHelpers";

export function useCyberActions(
  ownedItem: HydratedCyberItem | null,
  catalogTemplate: CyberTemplate | null,
): {
  action: { label: string; run: () => void } | null;
  install: {
    label: string;
    blockedHint?: string;
    swapWarning?: string;
    containers?: ContainerChoice[];
    noContainerHint?: string;
    hcRowDefs: { key: string; name: string; notation: string }[];
    confirmLabel?: string;
    onConfirm: (
      containerId: string | null,
      hcMap: Record<string, number>,
    ) => void;
  } | null;
  discard: { name: string; onDiscard: () => void } | null;
} {
  const template = ownedItem?.template ?? catalogTemplate;
  const effectiveHc = useEffectiveHc(template?.id, template?.hc ?? "0");
  const isOption = template?.role === "option";
  const isContainer = template?.role === "container";
  const isCyberArmor = !!template?.armorTemplateId;

  const containerChoices = useContainerChoices(
    isOption ? template?.id : undefined,
  );
  const noContainerHint = isOption
    ? `Install a ${template?.containerCategory ?? "container"} first`
    : undefined;

  const childHcRows = useMemo(() => {
    if (!ownedItem || !isContainer || ownedItem.installed) return [];
    return getChildHcRows(ownedItem.instanceId);
  }, [ownedItem, isContainer]);

  const cyberArmorBlockedHint = useCyberArmorBlockedHint(
    isCyberArmor ? template : null,
  );
  const skinweaveSwapWarning = useSkinweaveSwapWarning(
    isCyberArmor ? template : null,
  );

  // Cyber-armor: no Take, no Discard (install-only lifecycle)
  const discard =
    ownedItem && !isCyberArmor
      ? {
          name: template?.name ?? "",
          onDiscard: () => {
            discardCyber(ownedItem.instanceId);
            selectCyber(null);
          },
        }
      : null;

  // --- Cyber-armor: catalog item ---
  if (catalogTemplate?.armorTemplateId) {
    return {
      action: null, // No "Take" for cyber-armor
      install: {
        label: "Install",
        blockedHint: cyberArmorBlockedHint,
        swapWarning: skinweaveSwapWarning,
        hcRowDefs: [
          {
            key: catalogTemplate.id,
            name: catalogTemplate.name,
            notation: effectiveHc,
          },
        ],
        onConfirm: (_containerId, hcMap) => {
          import("@stores/cyber-armor").then(({ installCyberArmor }) => {
            const result = installCyberArmor(
              catalogTemplate.id,
              hcMap[catalogTemplate.id],
            );
            if (result.success) selectCyber(null);
            // TODO: surface result.error in popover (needs generic error display)
          });
        },
      },
      discard: null,
    };
  }

  // --- Cyber-armor: installed item ---
  if (ownedItem?.installed && ownedItem.template.armorTemplateId) {
    return {
      action: {
        label: "Uninstall",
        run: () => {
          import("@stores/cyber-armor").then(({ uninstallCyberArmor }) => {
            uninstallCyberArmor(ownedItem.instanceId);
            selectCyber(null);
          });
        },
      },
      install: null,
      discard: null,
    };
  }

  // --- Regular catalog item ---
  if (catalogTemplate) {
    return {
      action: {
        label: "Take",
        run: () => {
          const result = takeCyber(catalogTemplate.id);
          if (result) selectCyber(result.instanceId);
        },
      },
      install: {
        label: "Install",
        blockedHint:
          isContainer &&
          !canInstallContainer(
            catalogTemplate.category,
            catalogTemplate.instanceCost ?? 1,
          )
            ? `You cannot add any more ${CATEGORY_LABELS[catalogTemplate.category].toLowerCase()} base implants`
            : !canInstallTemplate(catalogTemplate)
              ? `${catalogTemplate.name} is already installed`
              : undefined,
        containers: isOption ? containerChoices : undefined,
        noContainerHint,
        hcRowDefs: [
          {
            key: catalogTemplate.id,
            name: catalogTemplate.name,
            notation: effectiveHc,
          },
        ],
        onConfirm: (containerId, hcMap) => {
          const result = installCyber(catalogTemplate.id, {
            hc: hcMap[catalogTemplate.id],
            parentId: containerId ?? undefined,
          });
          if (result) selectCyber(result.instanceId);
        },
      },
      discard,
    };
  }

  if (ownedItem && !ownedItem.installed) {
    const role = ownedItem.template.role;

    if (role === "option" && !ownedItem.parentId) {
      return {
        action: null,
        install: {
          label: "Slot",
          containers: containerChoices,
          noContainerHint,
          hcRowDefs: [
            {
              key: ownedItem.instanceId,
              name: ownedItem.template.name,
              notation: effectiveHc,
            },
          ],
          confirmLabel: "Slot",
          onConfirm: (containerId, hcMap) => {
            if (!containerId) return;
            slotOption(
              ownedItem.instanceId,
              containerId,
              hcMap[ownedItem.instanceId],
            );
          },
        },
        discard,
      };
    }

    if (role === "option" && ownedItem.parentId) {
      return {
        action: {
          label: "Unslot",
          run: () => unslotOption(ownedItem.instanceId),
        },
        install: null,
        discard,
      };
    }

    // Container or standalone, not installed
    return {
      action: null,
      install: {
        label: "Install",
        blockedHint: !canInstallTemplate(ownedItem.template)
          ? `${ownedItem.template.name} is already installed`
          : undefined,
        hcRowDefs: [
          {
            key: ownedItem.instanceId,
            name: ownedItem.template.name,
            notation: effectiveHc,
          },
          ...childHcRows,
        ],
        onConfirm: (_containerId, hcMap) =>
          installOwned(ownedItem.instanceId, hcMap),
      },
      discard,
    };
  }

  if (ownedItem?.installed) {
    return {
      action: {
        label: "Uninstall",
        run: () => {
          if (isOption) unslotOption(ownedItem.instanceId);
          else uninstallCyber(ownedItem.instanceId);
        },
      },
      install: null,
      discard,
    };
  }

  return { action: null, install: null, discard: null };
}
