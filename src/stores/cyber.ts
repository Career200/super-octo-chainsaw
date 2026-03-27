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

export type HydratedCyberItem = OwnedItem & {
  template: CyberTemplate;
  slotUsage?: { used: number; max: number | null };
};

export interface CyberItem {
  id: string;
  name: string;
  category: CyberCategory;
  description: string;
  hc: number | string;
  owned: boolean;
  installed: boolean;
  availability?: string;
  cost?: number;
  isBase?: boolean;
  role?: "container" | "option" | "standalone";
  parentId?: string;
  slotUsage?: { used: number; max: number | null };
  installedOptions?: string[];
}

export function hydratedToCyberItem(h: HydratedCyberItem): CyberItem {
  return {
    id: h.instanceId,
    name: h.template.name,
    category: h.template.category,
    description: h.template.description,
    hc: h.hc,
    owned: true,
    installed: h.installed,
    availability: h.template.availability,
    cost: h.template.cost,
    isBase: h.template.role === "container",
    role: h.template.role,
    parentId: h.parentId,
  };
}

// --- Persistent atom ---

export const $ownedCyber = persistentAtom<OwnedItem[]>("owned-cyber", [], {
  encode: JSON.stringify,
  decode: decodeJson<OwnedItem[]>([]),
});

// --- Houserule helpers ---

/** If the template is an optics container and the preinstalled rule is on, push a TSM item. */
function appendPreinstalled(
  template: CyberTemplate,
  parentInstanceId: string,
  out: OwnedItem[],
): void {
  if (template.category !== "optics" || template.role !== "container") return;
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

const TSM_IDS = ["tsm", "tsm-plus"];

/** Effective slot cost, respecting tsmFreeSlot houserule. */
function effectiveSlotCost(templateId: string): number {
  const t = CYBER_CATALOG[templateId];
  if (!t) return 1;
  if ($homerules.get().tsmFreeSlot && TSM_IDS.includes(templateId)) return 0;
  return t.slotCost ?? 1;
}

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
  const used = children.reduce(
    (sum, child) => sum + effectiveSlotCost(child.templateId),
    0,
  );

  return { used, max: template?.maxSlots ?? null };
}

/** Get children of a container for multi-row HC display. */
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

/** Find owned containers that can accept an option, with slot availability. */
export function getContainersForOption(
  templateId: string,
): {
  container: HydratedCyberItem;
  used: number;
  max: number | null;
  full: boolean;
}[] {
  const template = CYBER_CATALOG[templateId];
  if (!template || template.role !== "option" || !template.containerCategory)
    return [];

  const items = $ownedCyber.get();
  const optSlotCost = effectiveSlotCost(templateId);
  const results: {
    container: HydratedCyberItem;
    used: number;
    max: number | null;
    full: boolean;
  }[] = [];

  for (const item of items) {
    const ct = CYBER_CATALOG[item.templateId];
    if (
      !ct ||
      ct.role !== "container" ||
      ct.category !== template.containerCategory
    )
      continue;
    const { used, max } = getSlotUsage(item.instanceId);
    const full = max != null && used + optSlotCost > max;
    results.push({ container: { ...item, template: ct }, used, max, full });
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

/** Check whether another copy of this standalone template can be installed.
 *  Default limit: 1 for standalone (except fashionware), unlimited for containers/options. */
export function canInstallTemplate(template: CyberTemplate): boolean {
  if (template.role !== "standalone") return true;
  if (template.category === "fashionware") return true;
  // Cyber-armor has its own swap/limit logic
  if (template.armorTemplateId) return true;

  const limit = template.maxInstalled ?? 1;
  const count = $ownedCyber
    .get()
    .filter((i) => i.installed && i.templateId === template.id).length;
  return count < limit;
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

  if (!canInstallTemplate(template)) return null;

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

  if (template && !canInstallTemplate(template)) return;

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
    $ownedCyber
      .get()
      .map((i) =>
        i.instanceId === instanceId || i.parentId === instanceId
          ? { ...i, installed: false, hc: 0 }
          : i,
      ),
  );
}

/** Remove item + children from store entirely. */
export function discardCyber(instanceId: string): void {
  $ownedCyber.set(
    $ownedCyber
      .get()
      .filter((i) => i.instanceId !== instanceId && i.parentId !== instanceId),
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
  const slotCost = effectiveSlotCost(option.templateId);
  if (max != null && used + slotCost > max) return;

  const finalHc = container.installed ? (hc ?? rollHcDice(template.hc)) : 0;

  $ownedCyber.set(
    items.map((i) =>
      i.instanceId === optionInstanceId
        ? {
            ...i,
            parentId: containerInstanceId,
            installed: container.installed,
            hc: finalHc,
          }
        : i,
    ),
  );
}

/** Unslot an option from its container. Uninstalls if installed. */
export function unslotOption(optionInstanceId: string): void {
  $ownedCyber.set(
    $ownedCyber
      .get()
      .map((i) =>
        i.instanceId === optionInstanceId
          ? { ...i, parentId: undefined, installed: false, hc: 0 }
          : i,
      ),
  );
}

export function setItemHc(instanceId: string, hc: number): void {
  $ownedCyber.set(
    $ownedCyber
      .get()
      .map((i) =>
        i.instanceId === instanceId ? { ...i, hc: Math.max(0, hc) } : i,
      ),
  );
}

// --- Derive effects from installed items ---

function deriveEffects(items: readonly OwnedItem[]): void {
  const statBonuses: Record<string, number> = {};
  const statOverrides: Record<string, number> = {};
  const skillBonuses: Record<string, number> = {};
  const majorEffects: { key: string; text: string; category: string }[] = [];
  const minorEffects: { key: string; text: string; category: string }[] = [];
  let humanityLoss = 0;
  let initiativeBonus = 0;

  for (const item of items) {
    if (!item.installed) continue;
    humanityLoss += item.hc;

    const t = CYBER_CATALOG[item.templateId];
    if (!t) continue;

    if (t.statBonus) {
      for (const [stat, val] of Object.entries(t.statBonus)) {
        statBonuses[stat] = (statBonuses[stat] ?? 0) + val!;
      }
    }
    if (t.statOverride) {
      Object.assign(statOverrides, t.statOverride);
    }
    if (t.skillBonus) {
      for (const [skill, val] of Object.entries(t.skillBonus)) {
        skillBonuses[skill] = (skillBonuses[skill] ?? 0) + val;
      }
    }
    if (t.initiativeBonus) {
      initiativeBonus += t.initiativeBonus;
    }
    if (t.majorEffect) {
      majorEffects.push({ key: t.id, text: t.majorEffect, category: t.category });
    }
    if (t.minorEffect) {
      minorEffects.push({ key: t.id, text: t.minorEffect, category: t.category });
    }
  }

  // Stable display order: sort by category position
  const catIdx = (cat: string) => CATEGORY_ORDER.indexOf(cat as CyberCategory);
  majorEffects.sort((a, b) => catIdx(a.category) - catIdx(b.category));
  minorEffects.sort((a, b) => catIdx(a.category) - catIdx(b.category));

  $cyberEffects.set({
    humanityLoss,
    statBonuses,
    statOverrides,
    skillBonuses,
    skillOverrides: {},
    initiativeBonus,
    majorEffects,
    minorEffects,
  });
}

// Derive on load (in case $cyberEffects localStorage is stale/cleared)
deriveEffects($ownedCyber.get());
// Re-derive whenever installed list changes
$ownedCyber.listen((items) => deriveEffects(items));

// --- Computed stores ---

// Depends on $homerules so downstream memos recompute on any houserule change
// (e.g. tsmFreeSlot affects slot counts, future rules may affect other derived data)
export const $hydratedCyber = computed(
  [$ownedCyber, $homerules],
  (items, _rules): HydratedCyberItem[] => {
    // Pre-build children-per-container for slotUsage
    const childrenByParent = new Map<string, OwnedItem[]>();
    for (const item of items) {
      if (item.parentId) {
        let arr = childrenByParent.get(item.parentId);
        if (!arr) {
          arr = [];
          childrenByParent.set(item.parentId, arr);
        }
        arr.push(item);
      }
    }

    return items.flatMap((item) => {
      const template = CYBER_CATALOG[item.templateId];
      if (!template) return [];
      const hydrated: HydratedCyberItem = { ...item, template };
      if (template.role === "container") {
        const children = childrenByParent.get(item.instanceId) ?? [];
        const used = children.reduce(
          (sum, child) => sum + effectiveSlotCost(child.templateId),
          0,
        );
        hydrated.slotUsage = { used, max: template.maxSlots ?? null };
      }
      return [hydrated];
    });
  },
);

/** Resolved default option names per container template (static defaults + homerules). */
export const $catalogDefaults = computed([$homerules], (rules) => {
  const defaults: Record<string, string[]> = {};
  for (const t of Object.values(CYBER_CATALOG)) {
    if (t.role !== "container") continue;
    const names: string[] = [];
    if (t.defaultOptions) {
      for (const optId of t.defaultOptions) {
        const opt = CYBER_CATALOG[optId];
        if (opt) names.push(opt.name);
      }
    }
    if (t.category === "optics" && rules.cyberEyePreinstalled) {
      const opt = CYBER_CATALOG[rules.cyberEyePreinstalledOption];
      if (opt) names.push(opt.name);
    }
    if (names.length > 0) defaults[t.id] = names;
  }
  return defaults;
});

/** Catalog templates enriched with owned/installed status and default options. */
export const $cyberCatalog = computed(
  [$hydratedCyber, $catalogDefaults],
  (hydrated, defaults): Record<CyberCategory, CyberItem[]> => {
    const ownedIds = new Set(hydrated.map((i) => i.templateId));
    const installedIds = new Set(
      hydrated.filter((i) => i.installed).map((i) => i.templateId),
    );
    const result = {} as Record<CyberCategory, CyberItem[]>;
    for (const cat of CATEGORY_ORDER) result[cat] = [];
    for (const t of Object.values(CYBER_CATALOG)) {
      result[t.category].push({
        ...t,
        owned: ownedIds.has(t.id),
        installed: installedIds.has(t.id),
        isBase: t.role === "container",
        installedOptions: defaults[t.id],
      });
    }
    return result;
  },
);

/** Owned items with auto-numbering and slotUsage, sorted by name. */
export const $ownedCyberItems = computed(
  [$hydratedCyber],
  (hydrated): CyberItem[] => {
    const containerCounts: Record<string, number> = {};
    for (const h of hydrated) {
      if (h.template.role === "container") {
        containerCounts[h.templateId] =
          (containerCounts[h.templateId] ?? 0) + 1;
      }
    }
    const containerIndex: Record<string, number> = {};

    return hydrated
      .map((h) => {
        const item = hydratedToCyberItem(h);
        if (h.template.role === "container") {
          item.slotUsage = h.slotUsage;
          if (containerCounts[h.templateId] > 1) {
            containerIndex[h.templateId] =
              (containerIndex[h.templateId] ?? 0) + 1;
            item.name = `${h.template.name} #${containerIndex[h.templateId]}`;
          }
        }
        return item;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },
);

export const $installedByCategory = computed([$hydratedCyber], (hydrated) => {
  const installed = hydrated.filter((i) => i.installed);
  return CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: installed
      .filter((i) => i.template.category === cat)
      .map(hydratedToCyberItem),
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
