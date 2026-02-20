import { useStore } from "@nanostores/preact";
import { useRef, useState } from "preact/hooks";

import type { Availability } from "@scripts/catalog-common";
import type {
  Concealability,
  Reliability,
  WeaponTemplate,
  WeaponType,
} from "@scripts/weapons/catalog";
import {
  CALIBER_DAMAGE,
  RELIABILITY_LABELS,
  skillForType,
  WEAPON_TYPE_LABELS,
} from "@scripts/weapons/catalog";
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

import { BottomBarItemShell } from "../common/bottombar/BottomBarItemShell";
import { ConfirmPopover } from "../shared/ConfirmPopover";
import { ItemForm } from "../shared/ItemForm";

import { WeaponFormFields } from "./WeaponFormFields";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export const BottomBarWeapon = ({ expanded, onToggle }: Props) => {
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

  // Owned instance action state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const discardBtnRef = useRef<HTMLButtonElement>(null);

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

  const num = (s: string, fallback: number) => {
    const n = Number(s);
    return s === "" || isNaN(n) ? fallback : n;
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
      wa: num(newWa, 0),
      concealability: newConcealability,
      availability: (newAvailability as Availability) || "C",
      damage: newDamage.trim(),
      ammo: isMelee ? "" : newAmmo.trim(),
      shots: isMelee ? 0 : num(newShots, 0),
      rof: num(newRof, 1),
      reliability: newReliability,
      range: isMelee ? 1 : num(newRange, 50),
      cost: num(newCost, 0),
      description: newDescription.trim(),
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
  let headerActions = null;

  if (template && !adding) {
    // Template (catalog or custom not owned) — Take button
    const handleAcquire = (e: MouseEvent) => {
      e.stopPropagation();
      const id = acquireWeapon(template.templateId);
      if (id) selectWeapon(id);
    };
    headerActions = (
      <button class="bar-action" onClick={handleAcquire}>
        Take
      </button>
    );
  } else if (ownedPiece) {
    // Owned instance — Discard
    headerActions = (
      <>
        <button
          ref={discardBtnRef}
          class="bar-action bar-remove"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmOpen(true);
          }}
        >
          Discard
        </button>
        <ConfirmPopover
          anchorRef={discardBtnRef}
          open={confirmOpen}
          message={`Discard ${ownedPiece.name}?`}
          confirmText="Discard"
          cancelText="Keep"
          type="danger"
          onConfirm={() => {
            discardWeapon(ownedPiece.id);
            selectWeapon(null);
            setConfirmOpen(false);
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      </>
    );
  }

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
        onCostChange={(v) => {
          const n = v ? Number(v) : undefined;
          updateCustomWeapon(weaponId!, {
            cost: n != null && !isNaN(n) ? n : 0,
          });
        }}
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
            updateCustomWeapon(weaponId!, { wa: Number(v) || 0 })
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
              shots: Math.max(0, Number(v) || 0),
            })
          }
          rof={String(resolved.rof)}
          onRofChange={(v) =>
            updateCustomWeapon(weaponId!, { rof: Math.max(0, Number(v) || 0) })
          }
          reliability={resolved.reliability}
          onReliabilityChange={(v) =>
            updateCustomWeapon(weaponId!, { reliability: v })
          }
          range={String(resolved.range)}
          onRangeChange={(v) =>
            updateCustomWeapon(weaponId!, {
              range: Math.max(0, Number(v) || 0),
            })
          }
          melee={resolved.melee}
        />
      </ItemForm>
    );
  } else if (resolved) {
    // Catalog template or owned instance — read-only detail
    bodyContent = (
      <div class="weapon-detail">
        <div class="weapon-detail-stats">
          <span class="weapon-detail-stat">
            <span class="weapon-detail-label">Type</span>
            {WEAPON_TYPE_LABELS[resolved.type]}
          </span>
          <span class="weapon-detail-stat">
            <span class="weapon-detail-label">Skill</span>
            {resolved.skill}
            {!Object.keys(allSkills).some(
              (k) => k.toLowerCase() === resolved.skill.toLowerCase(),
            ) && (
              <span class="text-danger" style="font-size: var(--font-ui-sm)">
                Not found
              </span>
            )}
          </span>
          <span class="weapon-detail-stat">
            <span class="weapon-detail-label">Damage</span>
            {resolved.damage}
          </span>
          <span class="weapon-detail-stat">
            <span class="weapon-detail-label">WA</span>
            {resolved.wa >= 0 ? "+" : ""}
            {resolved.wa}
          </span>
          {!resolved.melee && (
            <>
              <span class="weapon-detail-stat">
                <span class="weapon-detail-label">Range</span>
                {resolved.range}m
              </span>
              <span class="weapon-detail-stat">
                <span class="weapon-detail-label">Ammo</span>
                {resolved.ammo}
              </span>
              <span class="weapon-detail-stat">
                <span class="weapon-detail-label">Shots</span>
                {resolved.shots}
              </span>
            </>
          )}
          <span class="weapon-detail-stat">
            <span class="weapon-detail-label">RoF</span>
            {resolved.rof}
          </span>
          <span class="weapon-detail-stat">
            <span class="weapon-detail-label">Rel.</span>
            {RELIABILITY_LABELS[resolved.reliability]}
          </span>
        </div>
        <p class="text-desc">{resolved.description}</p>
      </div>
    );
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
};
