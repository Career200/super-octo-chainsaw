import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";

import {
  CATEGORY_ORDER,
  CYBER_CATALOG,
  type CyberCategory,
  type CyberTemplate,
  rollHcDice,
} from "@scripts/cyber/catalog";

import { $cyberEffects, DEFAULT_EFFECTS } from "./cyber-effects";
import { decodeJson } from "./decode";
import { $EMP } from "./stats";

// --- Installed item shape ---

export interface InstalledItem {
  templateId: string;
  instanceId: string;
  parentId?: string;
  slot?: string;
  hc: number;
  sdpCurrent?: number;
}

export type HydratedCyberItem = InstalledItem & { template: CyberTemplate };

// --- Persistent atom ---

export const $installedCyber = persistentAtom<InstalledItem[]>(
  "installed-cyber",
  [],
  {
    encode: JSON.stringify,
    decode: decodeJson<InstalledItem[]>([]),
  },
);

// --- Actions ---

export function installCyber(
  templateId: string,
  opts?: { slot?: string; parentId?: string },
): InstalledItem | null {
  const template = CYBER_CATALOG[templateId];
  if (!template) return null;

  const item: InstalledItem = {
    templateId,
    instanceId: crypto.randomUUID(),
    hc: rollHcDice(template.hcDice),
    parentId: opts?.parentId,
    slot: opts?.slot,
  };

  $installedCyber.set([...$installedCyber.get(), item]);
  return item;
}

export function uninstallCyber(instanceId: string): void {
  const items = $installedCyber.get();
  $installedCyber.set(
    items.filter(
      (i) => i.instanceId !== instanceId && i.parentId !== instanceId,
    ),
  );
}

export function setItemHc(instanceId: string, hc: number): void {
  const items = $installedCyber.get();
  $installedCyber.set(
    items.map((i) =>
      i.instanceId === instanceId
        ? { ...i, hc: Math.max(0, Math.round(hc)) }
        : i,
    ),
  );
}

// --- Derive effects from installed items ---

function deriveEffects(items: readonly InstalledItem[]): void {
  const humanityLoss = items.reduce((sum, i) => sum + i.hc, 0);
  $cyberEffects.set({ ...DEFAULT_EFFECTS, humanityLoss });
}

// Derive on load (in case $cyberEffects localStorage is stale/cleared)
deriveEffects($installedCyber.get());
// Re-derive whenever installed list changes
$installedCyber.listen((items) => deriveEffects(items));

// --- Computed stores ---

export const $hydratedCyber = computed(
  [$installedCyber],
  (items): HydratedCyberItem[] =>
    items.flatMap((item) => {
      const template = CYBER_CATALOG[item.templateId];
      if (!template) return [];
      return [{ ...item, template }];
    }),
);

export const $installedByCategory = computed([$hydratedCyber], (hydrated) =>
  CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: hydrated.filter((i) => i.template.category === cat),
  })).filter(
    ({ category, items }) => category === "cyberlimbs" || items.length > 0,
  ),
);

export const $hcData = computed([$cyberEffects, $EMP], (effects, emp) => ({
  humanity: Math.max(0, emp.inherent * 10 - effects.humanityLoss),
  hcTotal: effects.humanityLoss,
  empBase: emp.inherent,
  empCurrent: Math.max(
    0,
    Math.ceil((emp.inherent * 10 - effects.humanityLoss) / 10),
  ),
}));
