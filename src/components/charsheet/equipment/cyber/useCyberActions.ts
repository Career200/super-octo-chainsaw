import { useMemo } from "preact/hooks";

import { type CyberTemplate } from "@scripts/cyber/catalog";
import {
  discardCyber,
  type HydratedCyberItem,
  installCyber,
  installOwned,
  slotOption,
  takeCyber,
  uninstallCyber,
  unslotOption,
} from "@stores/cyber";
import { selectCyber } from "@stores/ui";

import {
  type ContainerChoice,
  getChildHcRows,
  useContainerChoices,
  useEffectiveHc,
} from "./InstallPopover";

export function useCyberActions(
  ownedItem: HydratedCyberItem | null,
  catalogTemplate: CyberTemplate | null,
): {
  action: { label: string; run: () => void } | null;
  install: {
    label: string;
    disabled?: boolean;
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

  const discard = ownedItem
    ? {
        name: template?.name ?? "",
        onDiscard: () => {
          discardCyber(ownedItem.instanceId);
          selectCyber(null);
        },
      }
    : null;

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
        disabled: isOption && containerChoices.length === 0,
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
          disabled: containerChoices.length === 0,
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
