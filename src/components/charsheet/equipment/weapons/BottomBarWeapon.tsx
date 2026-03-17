import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";

import { AcquireDiscardActions } from "@components/charsheet/common/bottombar/AcquireDiscardActions";
import { BottomBarItemShell } from "@components/charsheet/common/bottombar/BottomBarItemShell";
import { parseNum } from "@components/charsheet/shared";
import { ItemForm } from "@components/charsheet/shared/ItemForm";
import type { Availability } from "@scripts/catalog-common";
import type {
  Concealability,
  Reliability,
  WeaponTemplate,
  WeaponType,
} from "@scripts/weapons/catalog";
import { CALIBER_DAMAGE, skillForType } from "@scripts/weapons/catalog";
import { $allSkills } from "@stores/skills";
import { $addingWeapon, $selectedWeapon, selectWeapon } from "@stores/ui";
import type { WeaponPiece } from "@stores/weapons";
import {
  $allOwnedWeapons,
  $customWeaponTemplates,
  acquireWeapon,
  addCustomWeapon,
  discardWeapon,
  isCustomWeapon,
  removeCustomWeapon,
  renameCustomWeapon,
  resolveWeaponTemplate,
  updateCustomWeapon,
} from "@stores/weapons";

import { WeaponDetail } from "./WeaponDetail";
import { WeaponFormFields } from "./WeaponFormFields";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export default function BottomBarWeapon({ expanded, onToggle }: Props) {
  const weaponId = useStore($selectedWeapon);
  const adding = useStore($addingWeapon);
  const ownedWeapons = useStore($allOwnedWeapons);
  const customDefs = useStore($customWeaponTemplates);
  const allSkills = useStore($allSkills);

  // Resolve: owned instance, or template (catalog/custom)
  const ownedPiece: WeaponPiece | null = weaponId
    ? (ownedWeapons.find((w) => w.id === weaponId) ?? null)
    : null;
  const template: WeaponTemplate | null =
    !ownedPiece && weaponId ? resolveWeaponTemplate(weaponId) : null;

  const isCustom = weaponId ? isCustomWeapon(weaponId) : false;
  const hasCustomDef = weaponId ? weaponId in customDefs : false;

  // Add-mode form state — all empty, showing placeholders
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newAvailability, setNewAvailability] = useState<Availability | "">("");
  const [newType, setNewType] = useState<WeaponType>("P");
  const [newSkill, setNewSkill] = useState("");
  const [newWa, setNewWa] = useState("");
  const [newConcealability, setNewConcealability] =
    useState<Concealability>("J");
  const [newDamage, setNewDamage] = useState("");
  const [newAmmo, setNewAmmo] = useState("");
  const [newShots, setNewShots] = useState("");
  const [newRof, setNewRof] = useState("");
  const [newReliability, setNewReliability] = useState<Reliability>("ST");
  const [newRange, setNewRange] = useState("");
  const [newMelee, setNewMelee] = useState(false);
  const [newEffects, setNewEffects] = useState("");

  // Validation: track whether user attempted to add
  const [addAttempted, setAddAttempted] = useState(false);

  const handleTypeChange = (t: WeaponType) => {
    setNewType(t);
    setNewMelee(t === "melee");
  };

  /** Case-insensitive CALIBER_DAMAGE lookup */
  const lookupCaliberDamage = (cal: string): string | undefined => {
    const lower = cal.trim().toLowerCase();
    for (const [k, v] of Object.entries(CALIBER_DAMAGE)) {
      if (k.toLowerCase() === lower) return v;
    }
  };

  const handleAmmoChange = (caliber: string) => {
    setNewAmmo(caliber);
    const dmg = lookupCaliberDamage(caliber);
    if (dmg) setNewDamage(dmg);
  };

  /** Resolve proper casing of a skill name from $allSkills */
  const resolveSkillName = (raw: string): string => {
    const lower = raw.trim().toLowerCase();
    for (const name of Object.keys(allSkills)) {
      if (name.toLowerCase() === lower) return name;
    }
    return raw.trim();
  };

  const handleAdd = (): string | null => {
    const trimmed = newName.trim();
    if (!trimmed || !newDamage.trim()) {
      setAddAttempted(true);
      if (!trimmed) return "Name cannot be empty";
      return "Damage cannot be empty";
    }
    const isMelee = newType === "melee";
    const isSkillCustom = newType === "EX" || isMelee;
    const ok = addCustomWeapon(trimmed, {
      type: newType,
      skill: isSkillCustom
        ? resolveSkillName(newSkill) || skillForType(newType)
        : skillForType(newType),
      wa: parseNum(newWa, 0),
      concealability: newConcealability,
      availability: (newAvailability as Availability) || "C",
      damage: newDamage.trim(),
      ammo: isMelee ? "" : newAmmo.trim(),
      shots: isMelee ? 0 : parseNum(newShots, 0),
      rof: parseNum(newRof, 1),
      reliability: newReliability,
      range: isMelee ? 1 : parseNum(newRange, 50),
      cost: parseNum(newCost, 0),
      description: newDescription.trim(),
      effects: newEffects.trim(),
      melee: isMelee,
      smartchipped: false,
    });
    if (ok) {
      setAddAttempted(false);
      setNewName("");
      setNewDescription("");
      setNewCost("");
      setNewAvailability("");
      setNewType("P");
      setNewSkill("");
      setNewWa("");
      setNewConcealability("J");
      setNewDamage("");
      setNewAmmo("");
      setNewShots("");
      setNewRof("");
      setNewReliability("ST");
      setNewRange("");
      setNewMelee(false);
      setNewEffects("");
      selectWeapon(trimmed);
      return null;
    }
    return `"${trimmed}" already exists`;
  };

  const handleRemove = () => {
    removeCustomWeapon(weaponId!);
    selectWeapon(null);
  };

  // Determine what to show
  const resolved = ownedPiece ?? template;
  const headerLabel = adding ? "New custom weapon" : (resolved?.name ?? "");
  const hasContent = adding || !!resolved;

  // Header actions
  const headerActions =
    template || ownedPiece ? (
      <AcquireDiscardActions
        showAcquire={!!template && !adding}
        onAcquire={(e) => {
          e.stopPropagation();
          const id = acquireWeapon(template!.templateId);
          if (id) selectWeapon(id);
        }}
        showDiscard={!!ownedPiece}
        discardName={ownedPiece?.name}
        onDiscard={() => {
          discardWeapon(ownedPiece!.id);
          selectWeapon(null);
        }}
      />
    ) : null;

  // Body content
  let bodyContent = null;

  if (adding) {
    const addErrors = new Set<string>();
    if (addAttempted) {
      if (!newName.trim()) addErrors.add("name");
      if (!newDamage.trim()) addErrors.add("damage");
    }
    bodyContent = (
      <ItemForm
        disabled={false}
        name={newName}
        onNameChange={setNewName}
        description={newDescription}
        onDescriptionChange={setNewDescription}
        cost={newCost}
        onCostChange={setNewCost}
        availability={newAvailability}
        onAvailabilityChange={setNewAvailability}
        errors={addErrors}
      >
        <WeaponFormFields
          type={newType}
          onTypeChange={handleTypeChange}
          skill={newSkill}
          onSkillChange={setNewSkill}
          wa={newWa}
          onWaChange={setNewWa}
          concealability={newConcealability}
          onConcealabilityChange={setNewConcealability}
          damage={newDamage}
          onDamageChange={setNewDamage}
          ammo={newAmmo}
          onAmmoChange={handleAmmoChange}
          shots={newShots}
          onShotsChange={setNewShots}
          rof={newRof}
          onRofChange={setNewRof}
          reliability={newReliability}
          onReliabilityChange={setNewReliability}
          range={newRange}
          onRangeChange={setNewRange}
          melee={newMelee || newType === "melee"}
          effects={newEffects}
          onEffectsChange={setNewEffects}
          errors={addErrors}
        />
      </ItemForm>
    );
  } else if (isCustom && hasCustomDef && resolved) {
    // Custom template — editable fields
    bodyContent = (
      <ItemForm
        disabled
        name={resolved.name}
        onNameChange={(v) => {
          if (renameCustomWeapon(weaponId!, v)) selectWeapon(v);
        }}
        description={resolved.description}
        onDescriptionChange={(v) =>
          updateCustomWeapon(weaponId!, { description: v })
        }
        cost={resolved.cost != null ? String(resolved.cost) : ""}
        onCostChange={(v) =>
          updateCustomWeapon(weaponId!, { cost: parseNum(v, 0) })
        }
        availability={resolved.availability ?? ""}
        onAvailabilityChange={(v) =>
          updateCustomWeapon(weaponId!, {
            availability: (v as Availability) || undefined,
          })
        }
      >
        <WeaponFormFields
          type={resolved.type}
          onTypeChange={(t) =>
            updateCustomWeapon(weaponId!, {
              type: t,
              melee: t === "melee",
              skill: skillForType(t),
            })
          }
          skill={resolved.skill}
          onSkillChange={(v) => updateCustomWeapon(weaponId!, { skill: v })}
          wa={String(resolved.wa)}
          onWaChange={(v) =>
            updateCustomWeapon(weaponId!, { wa: parseNum(v, 0) })
          }
          concealability={resolved.concealability}
          onConcealabilityChange={(v) =>
            updateCustomWeapon(weaponId!, { concealability: v })
          }
          damage={resolved.damage}
          onDamageChange={(v) => updateCustomWeapon(weaponId!, { damage: v })}
          ammo={resolved.ammo}
          onAmmoChange={(v) => {
            const updates: Record<string, unknown> = { ammo: v };
            const dmg = lookupCaliberDamage(v);
            if (dmg) updates.damage = dmg;
            updateCustomWeapon(weaponId!, updates);
          }}
          shots={String(resolved.shots)}
          onShotsChange={(v) =>
            updateCustomWeapon(weaponId!, {
              shots: Math.max(0, parseNum(v, 0)),
            })
          }
          rof={String(resolved.rof)}
          onRofChange={(v) =>
            updateCustomWeapon(weaponId!, { rof: Math.max(0, parseNum(v, 0)) })
          }
          reliability={resolved.reliability}
          onReliabilityChange={(v) =>
            updateCustomWeapon(weaponId!, { reliability: v })
          }
          range={String(resolved.range)}
          onRangeChange={(v) =>
            updateCustomWeapon(weaponId!, {
              range: Math.max(0, parseNum(v, 0)),
            })
          }
          melee={resolved.melee}
          effects={resolved.effects}
          onEffectsChange={(v) => updateCustomWeapon(weaponId!, { effects: v })}
        />
      </ItemForm>
    );
  } else if (resolved) {
    // Catalog template or owned instance — read-only detail
    bodyContent = <WeaponDetail weapon={resolved} />;
  }

  return (
    <BottomBarItemShell
      expanded={expanded}
      onToggle={onToggle}
      headerLabel={headerLabel}
      hasContent={hasContent}
      hintText="Select a weapon"
      adding={adding}
      onAdd={handleAdd}
      isCustom={isCustom && !ownedPiece}
      removeName={resolved?.name}
      onRemove={handleRemove}
      headerActions={headerActions}
    >
      {bodyContent}
    </BottomBarItemShell>
  );
}
