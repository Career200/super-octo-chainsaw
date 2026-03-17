import { useStore } from "@nanostores/preact";
import { useCallback, useRef, useState } from "preact/hooks";

import { BottomBarItemShell } from "@components/charsheet/common/bottombar/BottomBarItemShell";
import { parseNum, useEditToggle } from "@components/charsheet/shared";
import type { AmmoTemplate, Availability } from "@scripts/ammo/catalog";
import { AMMO_CATALOG } from "@scripts/ammo/catalog";
import { CALIBER_DAMAGE } from "@scripts/weapons/catalog";
import {
  $customAmmoItems,
  $ownedAmmo,
  addCustomAmmo,
  removeCustomAmmo,
  updateCustomAmmo,
} from "@stores/ammo";
import { $addingAmmo, $selectedAmmo, selectAmmo } from "@stores/ui";

import { AmmoDetail } from "./AmmoDetail";
import { AmmoForm } from "./AmmoForm";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export default function BottomBarAmmo({ expanded, onToggle }: Props) {
  const ammoId = useStore($selectedAmmo);
  const adding = useStore($addingAmmo);
  const quantities = useStore($ownedAmmo);
  const customDefs = useStore($customAmmoItems);

  // Resolve: catalog or custom
  const catalogTemplate = ammoId ? (AMMO_CATALOG[ammoId] ?? null) : null;
  const customDef = ammoId && !catalogTemplate ? customDefs[ammoId] : null;
  const resolved: AmmoTemplate | null = catalogTemplate
    ? catalogTemplate
    : customDef
      ? {
          templateId: ammoId!,
          caliber: customDef.caliber,
          type: customDef.type,
          damage: customDef.damage,
          effects: customDef.effects,
          description: customDef.description,
          cost: customDef.cost ?? 0,
          boxSize: customDef.boxSize ?? 50,
          availability: customDef.availability ?? "C",
        }
      : null;

  const isCustom = ammoId ? !!customDef : false;
  const quantity = ammoId ? (quantities[ammoId] ?? 0) : 0;

  // Edit toggle for custom ammo (view ↔ edit)
  const { editing, toggleEdit } = useEditToggle(
    ammoId,
    isCustom && !!customDef,
  );

  // Add-mode form state
  const [newCaliber, setNewCaliber] = useState("");
  const [newType, setNewType] = useState("");
  const [newDamage, setNewDamage] = useState("");
  const damageAutoFilled = useRef(false);
  const handleCaliberChange = useCallback(
    (cal: string) => {
      setNewCaliber(cal);
      const lookup = CALIBER_DAMAGE[cal] ?? CALIBER_DAMAGE[cal.toLowerCase()];
      if (lookup && (!newDamage || damageAutoFilled.current)) {
        setNewDamage(lookup);
        damageAutoFilled.current = true;
      }
    },
    [newDamage],
  );
  const handleDamageChange = useCallback((v: string) => {
    damageAutoFilled.current = false;
    setNewDamage(v);
  }, []);
  const [newEffects, setNewEffects] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newBoxSize, setNewBoxSize] = useState("50");
  const [newAvailability, setNewAvailability] = useState<Availability | "">("");
  const [addAttempted, setAddAttempted] = useState(false);

  const handleAdd = (): string | null => {
    const cal = newCaliber.trim();
    const typ = newType.trim();
    const dmg = newDamage.trim();
    if (!cal || !typ || !dmg) {
      setAddAttempted(true);
      if (!cal) return "Caliber cannot be empty";
      if (!typ) return "Type cannot be empty";
      return "Damage cannot be empty";
    }
    const bs = newBoxSize ? parseNum(newBoxSize, 50) : 0;
    const id = addCustomAmmo(cal, typ, {
      damage: dmg,
      effects: newEffects.trim(),
      description: newDescription.trim(),
      cost: newCost ? parseNum(newCost, 0) : undefined,
      boxSize: bs > 0 ? bs : undefined,
      availability: (newAvailability as Availability) || undefined,
    });
    if (id) {
      setAddAttempted(false);
      damageAutoFilled.current = false;
      setNewCaliber("");
      setNewType("");
      setNewDamage("");
      setNewEffects("");
      setNewDescription("");
      setNewCost("");
      setNewBoxSize("50");
      setNewAvailability("");
      selectAmmo(id);
      return null;
    }
    return `"${cal} ${typ}" already exists`;
  };

  const handleRemove = () => {
    removeCustomAmmo(ammoId!);
    selectAmmo(null);
  };

  const displayName = resolved ? `${resolved.caliber} ${resolved.type}` : "";

  // Body content
  let bodyContent = null;

  if (adding) {
    const addErrors = new Set<string>();
    if (addAttempted) {
      if (!newCaliber.trim()) addErrors.add("caliber");
      if (!newType.trim()) addErrors.add("type");
      if (!newDamage.trim()) addErrors.add("damage");
    }
    bodyContent = (
      <AmmoForm
        caliber={newCaliber}
        onCaliberChange={handleCaliberChange}
        type={newType}
        onTypeChange={setNewType}
        damage={newDamage}
        onDamageChange={handleDamageChange}
        effects={newEffects}
        onEffectsChange={setNewEffects}
        description={newDescription}
        onDescriptionChange={setNewDescription}
        cost={newCost}
        onCostChange={setNewCost}
        boxSize={newBoxSize}
        onBoxSizeChange={setNewBoxSize}
        availability={newAvailability}
        onAvailabilityChange={(v) => setNewAvailability(v as Availability | "")}
        errors={addErrors}
        autoFocus
      />
    );
  } else if (isCustom && editing && resolved) {
    bodyContent = (
      <AmmoForm
        caliber={resolved.caliber}
        type={resolved.type}
        damage={resolved.damage}
        onDamageChange={(v) => updateCustomAmmo(ammoId!, { damage: v })}
        effects={resolved.effects}
        onEffectsChange={(v) => updateCustomAmmo(ammoId!, { effects: v })}
        description={resolved.description}
        onDescriptionChange={(v) =>
          updateCustomAmmo(ammoId!, { description: v })
        }
        cost={resolved.cost != null ? String(resolved.cost) : ""}
        onCostChange={(v) =>
          updateCustomAmmo(ammoId!, { cost: parseNum(v, 0) })
        }
        boxSize={String(resolved.boxSize)}
        onBoxSizeChange={(v) => {
          const n = parseNum(v, 50);
          updateCustomAmmo(ammoId!, { boxSize: n > 0 ? n : 50 });
        }}
        availability={resolved.availability ?? ""}
        onAvailabilityChange={(v) =>
          updateCustomAmmo(ammoId!, {
            availability: (v as Availability) || undefined,
          })
        }
      />
    );
  } else if (resolved) {
    bodyContent = <AmmoDetail template={resolved} quantity={quantity} />;
  }

  return (
    <BottomBarItemShell
      expanded={expanded}
      onToggle={onToggle}
      headerLabel={adding ? "New custom ammo" : displayName}
      hasContent={adding || !!resolved}
      hintText="Select an ammo"
      adding={adding}
      onAdd={handleAdd}
      isCustom={isCustom}
      removeName={displayName}
      onRemove={handleRemove}
      headerActions={
        isCustom && !adding && customDef ? (
          <button
            class="bar-action"
            onClick={(e) => {
              e.stopPropagation();
              toggleEdit();
            }}
          >
            {editing ? "Done" : "Edit"}
          </button>
        ) : null
      }
    >
      {bodyContent}
    </BottomBarItemShell>
  );
}
