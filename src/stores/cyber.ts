import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";

import {
  CATEGORY_ORDER,
  CYBER_CATALOG,
  type CyberTemplate,
  rollHcDice,
} from "@scripts/cyber/catalog";

import { $cyberEffects, DEFAULT_EFFECTS } from "./cyber-effects";
import { decodeJson } from "./decode";
import { $EMP } from "./stats";

// --- Owned item shape ---

export interface OwnedItem {
  templateId: string;
  instanceId: string;
  parentId?: string;
  slot?: string;
  hc: number;
  installed: boolean;
  sdpCurrent?: number;
}

export type HydratedCyberItem = OwnedItem & { template: CyberTemplate };

// --- Persistent atom ---

export const $ownedCyber = persistentAtom<OwnedItem[]>(
  "owned-cyber",
  [],
  {
    encode: JSON.stringify,
    decode: decodeJson<OwnedItem[]>([]),
  },
);

// --- Actions ---

/** Own without installing. No HC cost, no surgery. */
export function takeCyber(templateId: string): OwnedItem | null {
  const template = CYBER_CATALOG[templateId];
  if (!template) return null;

  const item: OwnedItem = {
    templateId,
    instanceId: crypto.randomUUID(),
    hc: 0,
    installed: false,
  };

  $ownedCyber.set([...$ownedCyber.get(), item]);
  return item;
}

/** Own + install in one step (from catalog). Rolls HC. */
export function installCyber(
  templateId: string,
  opts?: { slot?: string; parentId?: string; hc?: number },
): OwnedItem | null {
  const template = CYBER_CATALOG[templateId];
  if (!template) return null;

  const item: OwnedItem = {
    templateId,
    instanceId: crypto.randomUUID(),
    hc: opts?.hc ?? rollHcDice(template.hc),
    installed: true,
    parentId: opts?.parentId,
    slot: opts?.slot,
  };

  $ownedCyber.set([...$ownedCyber.get(), item]);
  return item;
}

/** Install an already-owned item. Uses provided HC or rolls from template. */
export function installOwned(instanceId: string, hc?: number): void {
  const items = $ownedCyber.get();
  const item = items.find((i) => i.instanceId === instanceId);
  if (!item || item.installed) return;

  const template = CYBER_CATALOG[item.templateId];
  const finalHc = hc ?? (template ? rollHcDice(template.hc) : 0);

  $ownedCyber.set(
    items.map((i) =>
      i.instanceId === instanceId ? { ...i, installed: true, hc: finalHc } : i,
    ),
  );
}

/** Uninstall — item stays owned, HC zeroed. */
export function uninstallCyber(instanceId: string): void {
  $ownedCyber.set(
    $ownedCyber.get().map((i) =>
      i.instanceId === instanceId || i.parentId === instanceId
        ? { ...i, installed: false, hc: 0 }
        : i,
    ),
  );
}

/** Remove item + children from store entirely. */
export function discardCyber(instanceId: string): void {
  $ownedCyber.set(
    $ownedCyber.get().filter(
      (i) => i.instanceId !== instanceId && i.parentId !== instanceId,
    ),
  );
}

export function setItemHc(instanceId: string, hc: number): void {
  $ownedCyber.set(
    $ownedCyber.get().map((i) =>
      i.instanceId === instanceId ? { ...i, hc: Math.max(0, hc) } : i,
    ),
  );
}

// --- Derive effects from installed items ---

function deriveEffects(items: readonly OwnedItem[]): void {
  const humanityLoss = items.reduce(
    (sum, i) => (i.installed ? sum + i.hc : sum),
    0,
  );
  $cyberEffects.set({ ...DEFAULT_EFFECTS, humanityLoss });
}

// Derive on load (in case $cyberEffects localStorage is stale/cleared)
deriveEffects($ownedCyber.get());
// Re-derive whenever installed list changes
$ownedCyber.listen((items) => deriveEffects(items));

// --- Computed stores ---

export const $hydratedCyber = computed(
  [$ownedCyber],
  (items): HydratedCyberItem[] =>
    items.flatMap((item) => {
      const template = CYBER_CATALOG[item.templateId];
      if (!template) return [];
      return [{ ...item, template }];
    }),
);

export const $installedByCategory = computed([$hydratedCyber], (hydrated) => {
  const installed = hydrated.filter((i) => i.installed);
  return CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: installed.filter((i) => i.template.category === cat),
  })).filter(
    ({ category, items }) => category === "cyberlimbs" || items.length > 0,
  );
});

export const $hcData = computed([$cyberEffects, $EMP], (effects, emp) => ({
  humanity: Math.max(0, emp.inherent * 10 - effects.humanityLoss),
  hcTotal: effects.humanityLoss,
  empBase: emp.inherent,
  empCurrent: Math.max(
    0,
    Math.ceil((emp.inherent * 10 - effects.humanityLoss) / 10),
  ),
}));
