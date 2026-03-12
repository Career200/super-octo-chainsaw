import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";

import {
  CATEGORY_MAX_INSTANCES,
  CATEGORY_ORDER,
  CYBER_CATALOG,
  type CyberCategory,
  type CyberTemplate,
  rollHcDice,
} from "@scripts/cyber/catalog";

import { $cyberEffects, DEFAULT_EFFECTS } from "./cyber-effects";
import { decodeJson } from "./decode";
import { $homerules } from "./homerules";
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

// --- Houserule helpers ---

/** If the template is a cyber eye and the preinstalled rule is on, push a TSM item. */
function appendPreinstalled(
  template: CyberTemplate,
  parentInstanceId: string,
  out: OwnedItem[],
): void {
  if (template.id !== "basic-eye") return;
  const rules = $homerules.get();
  if (!rules.cyberEyePreinstalled) return;

  const tsmTemplate = CYBER_CATALOG[rules.cyberEyePreinstalledOption];
  if (!tsmTemplate) return;

  out.push({
    templateId: tsmTemplate.id,
    instanceId: crypto.randomUUID(),
    hc: rules.tsmFreeHc ? 0 : rollHcDice(tsmTemplate.hc),
    installed: true,
    parentId: parentInstanceId,
  });
}

// --- Helpers ---

/** Count options slotted into a container vs its maxSlots. */
export function getSlotUsage(containerInstanceId: string): {
  used: number;
  max: number | null;
} {
  const items = $ownedCyber.get();
  const container = items.find((i) => i.instanceId === containerInstanceId);
  if (!container) return { used: 0, max: null };

  const template = CYBER_CATALOG[container.templateId];
  const children = items.filter((i) => i.parentId === containerInstanceId);
  const used = children.reduce((sum, child) => {
    const ct = CYBER_CATALOG[child.templateId];
    return sum + (ct?.slotCost ?? 1);
  }, 0);

  return { used, max: template?.maxSlots ?? null };
}

/** Find owned containers that can accept an option, with slot availability. */
export function getContainersForOption(
  templateId: string,
): { container: HydratedCyberItem; used: number; max: number | null }[] {
  const template = CYBER_CATALOG[templateId];
  if (!template || template.role !== "option" || !template.containerCategory)
    return [];

  const items = $ownedCyber.get();
  const optSlotCost = template.slotCost ?? 1;
  const results: {
    container: HydratedCyberItem;
    used: number;
    max: number | null;
  }[] = [];

  for (const item of items) {
    const ct = CYBER_CATALOG[item.templateId];
    if (!ct || ct.role !== "container" || ct.category !== template.containerCategory)
      continue;
    const { used, max } = getSlotUsage(item.instanceId);
    if (max != null && used + optSlotCost > max) continue;
    results.push({ container: { ...item, template: ct }, used, max });
  }

  return results;
}

/** Check whether the category has room for another container (body limit, not inventory). */
export function canInstallContainer(
  category: CyberCategory,
  instanceCost = 1,
): boolean {
  const limit = CATEGORY_MAX_INSTANCES[category];
  if (limit == null) return true;

  const items = $ownedCyber.get();
  const usedSlots = items.reduce((sum, i) => {
    if (!i.installed) return sum;
    const ct = CYBER_CATALOG[i.templateId];
    if (!ct || ct.role !== "container" || ct.category !== category) return sum;
    return sum + (ct.instanceCost ?? 1);
  }, 0);

  return usedSlots + instanceCost <= limit;
}

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

/** Own + install in one step (from catalog). Rolls HC.
 *  Containers: checks category maxInstances.
 *  Options: requires parentId; installed state mirrors the container. */
export function installCyber(
  templateId: string,
  opts?: { slot?: string; parentId?: string; hc?: number },
): OwnedItem | null {
  const template = CYBER_CATALOG[templateId];
  if (!template) return null;

  if (template.role === "container") {
    if (!canInstallContainer(template.category, template.instanceCost ?? 1))
      return null;
  }

  // Options must target a container
  if (template.role === "option") {
    if (!opts?.parentId) return null;
    const items = $ownedCyber.get();
    const parent = items.find((i) => i.instanceId === opts.parentId);
    if (!parent) return null;
    // Option's installed state mirrors its container
    const item: OwnedItem = {
      templateId,
      instanceId: crypto.randomUUID(),
      hc: parent.installed ? (opts.hc ?? rollHcDice(template.hc)) : 0,
      installed: parent.installed,
      parentId: opts.parentId,
      slot: opts.slot,
    };
    $ownedCyber.set([...items, item]);
    return item;
  }

  // Container or standalone
  const item: OwnedItem = {
    templateId,
    instanceId: crypto.randomUUID(),
    hc: opts?.hc ?? rollHcDice(template.hc),
    installed: true,
    parentId: opts?.parentId,
    slot: opts?.slot,
  };

  const newItems: OwnedItem[] = [item];
  appendPreinstalled(template, item.instanceId, newItems);

  $ownedCyber.set([...$ownedCyber.get(), ...newItems]);
  return item;
}

/** Install an already-owned item.
 *  hcMap: { instanceId: hc } for each item to install. If omitted, rolls from template.
 *  Containers cascade: install all slotted children too.
 *  Options without parentId are rejected (must be slotted first). */
export function installOwned(
  instanceId: string,
  hcMap?: Record<string, number>,
): void {
  const items = $ownedCyber.get();
  const item = items.find((i) => i.instanceId === instanceId);
  if (!item || item.installed) return;

  const template = CYBER_CATALOG[item.templateId];

  // Options must be slotted into a container
  if (template?.role === "option" && !item.parentId) return;

  // Containers: check category limit
  if (
    template?.role === "container" &&
    !canInstallContainer(template.category, template.instanceCost ?? 1)
  )
    return;

  const resolveHc = (i: OwnedItem) => {
    if (hcMap && i.instanceId in hcMap) return hcMap[i.instanceId];
    const t = CYBER_CATALOG[i.templateId];
    return t ? rollHcDice(t.hc) : 0;
  };

  const isChild = (i: OwnedItem) => i.parentId === instanceId;

  const updated = items.map((i) => {
    if (i.instanceId === instanceId)
      return { ...i, installed: true, hc: resolveHc(i) };
    // Cascade: install slotted children of a container
    if (template?.role === "container" && isChild(i) && !i.installed)
      return { ...i, installed: true, hc: resolveHc(i) };
    return i;
  });

  if (template) appendPreinstalled(template, instanceId, updated);

  $ownedCyber.set(updated);
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

/** Slot an option into a container. If container is installed, option is installed too. */
export function slotOption(
  optionInstanceId: string,
  containerInstanceId: string,
  hc?: number,
): void {
  const items = $ownedCyber.get();
  const option = items.find((i) => i.instanceId === optionInstanceId);
  const container = items.find((i) => i.instanceId === containerInstanceId);
  if (!option || !container || option.parentId) return;

  const template = CYBER_CATALOG[option.templateId];
  if (!template || template.role !== "option") return;

  // Check slot availability
  const { used, max } = getSlotUsage(containerInstanceId);
  const slotCost = template.slotCost ?? 1;
  if (max != null && used + slotCost > max) return;

  const finalHc = container.installed
    ? (hc ?? rollHcDice(template.hc))
    : 0;

  $ownedCyber.set(
    items.map((i) =>
      i.instanceId === optionInstanceId
        ? { ...i, parentId: containerInstanceId, installed: container.installed, hc: finalHc }
        : i,
    ),
  );
}

/** Unslot an option from its container. Uninstalls if installed. */
export function unslotOption(optionInstanceId: string): void {
  $ownedCyber.set(
    $ownedCyber.get().map((i) =>
      i.instanceId === optionInstanceId
        ? { ...i, parentId: undefined, installed: false, hc: 0 }
        : i,
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
