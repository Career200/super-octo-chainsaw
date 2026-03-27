import { IMPLANT_TEMPLATES } from "@scripts/armor/catalog";
import type { WearResult } from "./armor/actions";
import {
  installImplant,
  installSkinweave,
  uninstallImplant,
  uninstallSkinweave,
} from "./armor/implants";
import { $ownedArmor } from "./armor/state";
import { $ownedCyber, discardCyber } from "./cyber";
import { CYBER_CATALOG } from "@scripts/cyber/catalog";

// --- Install / Uninstall ---

export function installCyberArmor(
  cyberTemplateId: string,
  hc: number,
): WearResult {
  const template = CYBER_CATALOG[cyberTemplateId];
  if (!template?.armorTemplateId) {
    return { success: false, error: "Invalid cyber-armor template" };
  }

  // Skinweave: remove existing skinweave from both stores before installing
  if (template.skinweave) {
    const existingCyber = findInstalledSkinweaveCyber();
    if (existingCyber) {
      uninstallSkinweave();
      discardCyber(existingCyber.instanceId);
    }

    const result = installSkinweave(template.armorTemplateId);
    if (!result.success) return result;
  } else {
    const result = installImplant(template.armorTemplateId);
    if (!result.success) return result;
  }

  // Add to $ownedCyber
  $ownedCyber.set([
    ...$ownedCyber.get(),
    {
      templateId: cyberTemplateId,
      instanceId: crypto.randomUUID(),
      hc,
      installed: true,
    },
  ]);

  return { success: true };
}

export function uninstallCyberArmor(cyberInstanceId: string): void {
  const items = $ownedCyber.get();
  const item = items.find((i) => i.instanceId === cyberInstanceId);
  if (!item) return;

  const template = CYBER_CATALOG[item.templateId];
  if (!template?.armorTemplateId) return;

  if (template.skinweave) {
    uninstallSkinweave();
  } else {
    uninstallImplant(template.armorTemplateId);
  }

  discardCyber(cyberInstanceId);
}

// --- Helpers ---

function findInstalledSkinweaveCyber() {
  return $ownedCyber
    .get()
    .find(
      (i) =>
        i.installed && CYBER_CATALOG[i.templateId]?.skinweave === true,
    );
}

export function getInstalledSkinweaveCyberName(): string | null {
  const item = findInstalledSkinweaveCyber();
  if (!item) return null;
  return CYBER_CATALOG[item.templateId]?.name ?? null;
}

// --- Orphan Cleanup ---
// Removes implant armor instances from $ownedArmor that have no corresponding
// $ownedCyber entry. Handles pre-M3 installs. Run on first import (cyber tab load).

function cleanOrphanedImplants(): void {
  const ownedArmor = $ownedArmor.get();
  const cyberItems = $ownedCyber.get();

  // Build a set of armorTemplateIds that are tracked by cyber items
  const cyberArmorTemplateIds = new Set<string>();
  for (const item of cyberItems) {
    const ct = CYBER_CATALOG[item.templateId];
    if (ct?.armorTemplateId && item.installed) {
      cyberArmorTemplateIds.add(ct.armorTemplateId);
    }
  }

  const toRemove: string[] = [];
  for (const [id, instance] of Object.entries(ownedArmor)) {
    if (
      instance.templateId in IMPLANT_TEMPLATES &&
      !cyberArmorTemplateIds.has(instance.templateId)
    ) {
      toRemove.push(id);
    }
  }

  if (toRemove.length > 0) {
    const next = { ...ownedArmor };
    for (const id of toRemove) delete next[id];
    $ownedArmor.set(next);
  }
}

// Run cleanup on module load (when cyber tab loads)
cleanOrphanedImplants();
