import { getTemplate, IMPLANT_TEMPLATES } from "@scripts/armor/catalog";
import type { ArmorLayer, ArmorPiece, ArmorTemplate, BodyPartName } from "@scripts/armor/core";
import { getPartSpMax } from "@scripts/armor/core";

import type { WearResult } from "./actions";
import { acquireArmor, checkLayerConstraints, discardArmor } from "./actions";
import {
  $ownedArmor,
  getBodyPartLayers,
  getImplantsForPart,
  getInstalledImplants,
  isImplant,
  isSkinweave,
  updateInstance,
} from "./state";

// --- Implant Queries ---

export function getImplantLayer(templateId: string): ArmorLayer | null {
  const template = getTemplate(templateId);
  return template?.layer ?? null;
}

export function getImplantTemplates(): Record<string, ArmorTemplate> {
  return IMPLANT_TEMPLATES;
}

export function isImplantInstalled(templateId: string): boolean {
  const state = $ownedArmor.get();
  return Object.values(state).some(
    (inst) => inst.templateId === templateId && inst.worn,
  );
}

// --- Implant Actions ---

export function installImplant(templateId: string): WearResult {
  const template = getTemplate(templateId);
  if (!template || !isImplant(templateId)) {
    return { success: false, error: "Invalid implant" };
  }

  if (isImplantInstalled(templateId)) {
    return { success: false, error: "Already installed" };
  }

  for (const part of template.bodyParts) {
    const result = checkLayerConstraints(
      part,
      template.type,
      template.layer,
      getBodyPartLayers(part),
      getImplantsForPart(part),
    );
    if (!result.success) return result;
  }

  const instance = acquireArmor(templateId);
  if (instance) {
    updateInstance(instance.id, { worn: true });
  }

  return { success: true };
}

export function uninstallImplant(templateId: string): void {
  const state = $ownedArmor.get();
  const instance = Object.values(state).find(
    (inst) => inst.templateId === templateId && inst.worn,
  );

  if (instance) {
    discardArmor(instance.id);
  }
}

export function repairImplant(instanceId: string): void {
  const instance = $ownedArmor.get()[instanceId];
  if (!instance || !isImplant(instance.templateId)) return;

  const template = getTemplate(instance.templateId);
  if (!template) return;

  const newSpByPart: Partial<Record<BodyPartName, number>> = {};
  for (const part of template.bodyParts) {
    newSpByPart[part] = getPartSpMax(template, part);
  }

  updateInstance(instanceId, { spByPart: newSpByPart });
}

// --- Skinweave Helpers ---

export function getInstalledSkinweave(): ArmorPiece | null {
  const installed = getInstalledImplants().find((p) => isSkinweave(p));
  return installed ?? null;
}

export function getSkinweaveLevel(): number {
  const skinweave = getInstalledSkinweave();
  return skinweave?.spMax ?? 0;
}

export function installSkinweave(templateId: string): WearResult {
  const template = getTemplate(templateId);
  if (!template || !isSkinweave(templateId)) {
    return { success: false, error: "Invalid skinweave" };
  }

  const existing = getInstalledSkinweave();
  if (existing) {
    uninstallImplant(existing.templateId);
  }

  const instance = acquireArmor(templateId);
  if (instance) {
    updateInstance(instance.id, { worn: true });
  }

  return { success: true };
}

export function uninstallSkinweave(): void {
  const skinweave = getInstalledSkinweave();
  if (skinweave) {
    uninstallImplant(skinweave.templateId);
  }
}
