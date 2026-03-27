import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";

import { AcquireDiscardActions } from "@components/charsheet/common/bottombar/AcquireDiscardActions";
import { BottomBarItemShell } from "@components/charsheet/common/bottombar/BottomBarItemShell";
import { parseNum, useFormState } from "@components/charsheet/shared";
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

  // Add-mode form state
  const { fields: f, setField, reset } = useFormState({
    name: "",
    description: "",
    cost: "",
    availability: "" as Availability | "",
    type: "P" as WeaponType,
    skill: "",
    wa: "",
    concealability: "J" as Concealability,
    damage: "",
    ammo: "",
    shots: "",
    rof: "",
    reliability: "ST" as Reliability,
    range: "",
    melee: false,
    effects: "",
  });

  // Validation: track whether user attempted to add
  const [addAttempted, setAddAttempted] = useState(false);

  const handleTypeChange = (t: WeaponType) => {
    setField("type", t);
    setField("melee", t === "melee");
  };

  /** Case-insensitive CALIBER_DAMAGE lookup */
  const lookupCaliberDamage = (cal: string): string | undefined => {
    const lower = cal.trim().toLowerCase();
    for (const [k, v] of Object.entries(CALIBER_DAMAGE)) {
      if (k.toLowerCase() === lower) return v;
    }
  };

  const handleAmmoChange = (caliber: string) => {
    setField("ammo", caliber);
    const dmg = lookupCaliberDamage(caliber);
    if (dmg) setField("damage", dmg);
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
    const trimmed = f.name.trim();
    if (!trimmed || !f.damage.trim()) {
      setAddAttempted(true);
      if (!trimmed) return "Name cannot be empty";
      return "Damage cannot be empty";
    }
    const isMelee = f.type === "melee";
    const isSkillCustom = f.type === "EX" || isMelee;
    const ok = addCustomWeapon(trimmed, {
      type: f.type,
      skill: isSkillCustom
        ? resolveSkillName(f.skill) || skillForType(f.type)
        : skillForType(f.type),
      wa: parseNum(f.wa, 0),
      concealability: f.concealability,
      availability: (f.availability as Availability) || "C",
      damage: f.damage.trim(),
      ammo: isMelee ? "" : f.ammo.trim(),
      shots: isMelee ? 0 : parseNum(f.shots, 0),
      rof: parseNum(f.rof, 1),
      reliability: f.reliability,
      range: isMelee ? 1 : parseNum(f.range, 50),
      cost: parseNum(f.cost, 0),
      description: f.description.trim(),
      effects: f.effects.trim(),
      melee: isMelee,
      smartchipped: false,
    });
    if (ok) {
      setAddAttempted(false);
      reset();
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
      if (!f.name.trim()) addErrors.add("name");
      if (!f.damage.trim()) addErrors.add("damage");
    }
    bodyContent = (
      <ItemForm
        disabled={false}
        name={f.name}
        onNameChange={(v) => setField("name", v)}
        description={f.description}
        onDescriptionChange={(v) => setField("description", v)}
        cost={f.cost}
        onCostChange={(v) => setField("cost", v)}
        availability={f.availability}
        onAvailabilityChange={(v) => setField("availability", v)}
        errors={addErrors}
      >
        <WeaponFormFields
          type={f.type}
          onTypeChange={handleTypeChange}
          skill={f.skill}
          onSkillChange={(v) => setField("skill", v)}
          wa={f.wa}
          onWaChange={(v) => setField("wa", v)}
          concealability={f.concealability}
          onConcealabilityChange={(v) => setField("concealability", v)}
          damage={f.damage}
          onDamageChange={(v) => setField("damage", v)}
          ammo={f.ammo}
          onAmmoChange={handleAmmoChange}
          shots={f.shots}
          onShotsChange={(v) => setField("shots", v)}
          rof={f.rof}
          onRofChange={(v) => setField("rof", v)}
          reliability={f.reliability}
          onReliabilityChange={(v) => setField("reliability", v)}
          range={f.range}
          onRangeChange={(v) => setField("range", v)}
          melee={f.melee || f.type === "melee"}
          effects={f.effects}
          onEffectsChange={(v) => setField("effects", v)}
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
