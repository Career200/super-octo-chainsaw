import { useStore } from "@nanostores/preact";
import { useCallback, useRef, useState } from "preact/hooks";

import type { AmmoTemplate, Availability } from "@scripts/ammo/catalog";
import { AMMO_CATALOG } from "@scripts/ammo/catalog";
import { CALIBER_DAMAGE } from "@scripts/weapons/catalog";
import { AVAILABILITY_LABELS } from "@scripts/catalog-common";
import {
  $customAmmoItems,
  $ownedAmmo,
  addAmmo,
  addCustomAmmo,
  removeAmmo,
  removeCustomAmmo,
  updateCustomAmmo,
} from "@stores/ammo";
import { $addingAmmo, $selectedAmmo, selectAmmo } from "@stores/ui";

import { BottomBarItemShell } from "../common/bottombar/BottomBarItemShell";
import { Tip } from "../shared";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

// --- Detail view ---

function AmmoDetail({
  template,
  quantity,
}: {
  template: AmmoTemplate;
  quantity: number;
}) {
  return (
    <div class="weapon-detail">
      <div class="weapon-detail-stats">
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">Caliber</span>
          {template.caliber}
        </span>
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">Type</span>
          {template.type}
        </span>
        <span class="weapon-detail-stat">
          <span class="weapon-detail-label">Damage</span>
          {template.damage}
        </span>
        {template.cost != null && (
          <span class="weapon-detail-stat">
            <span class="weapon-detail-label">Cost</span>
            {template.cost}eb
          </span>
        )}
        {template.availability && (
          <span class="weapon-detail-stat">
            <span class="weapon-detail-label">Avail.</span>
            {AVAILABILITY_LABELS[template.availability] ??
              template.availability}
          </span>
        )}
      </div>
      {template.effects && (
        <p class="text-desc" style="color: var(--accent)">
          {template.effects}
        </p>
      )}
      {template.description && <p class="text-desc">{template.description}</p>}
      <div class="gear-qty-controls cc-ammo-stepper">
        <button
          class="btn-sm ammo-qty-btn"
          onClick={() => removeAmmo(template.templateId, 100)}
        >
          −100
        </button>
        <button
          class="btn-sm ammo-qty-btn"
          onClick={() => removeAmmo(template.templateId)}
        >
          −
        </button>
        <span class="gear-qty-value cc-ammo-value">{quantity}</span>
        <button
          class="btn-sm ammo-qty-btn"
          onClick={() => addAmmo(template.templateId, 1)}
        >
          +
        </button>
        <button
          class="btn-sm ammo-qty-btn"
          onClick={() => addAmmo(template.templateId, 100)}
        >
          +100
        </button>
      </div>
    </div>
  );
}

// --- Form (add / edit custom) ---

function AmmoForm({
  caliber,
  onCaliberChange,
  type,
  onTypeChange,
  damage,
  onDamageChange,
  effects,
  onEffectsChange,
  description,
  onDescriptionChange,
  cost,
  onCostChange,
  availability,
  onAvailabilityChange,
  errors,
  autoFocus,
}: {
  caliber: string;
  onCaliberChange?: (v: string) => void;
  type: string;
  onTypeChange?: (v: string) => void;
  damage: string;
  onDamageChange?: (v: string) => void;
  effects: string;
  onEffectsChange?: (v: string) => void;
  description: string;
  onDescriptionChange?: (v: string) => void;
  cost: string;
  onCostChange?: (v: string) => void;
  availability: string;
  onAvailabilityChange?: (v: string) => void;
  errors?: ReadonlySet<string>;
  autoFocus?: boolean;
}) {
  const inp = (
    field: string,
    value: string,
    onChange: ((v: string) => void) | undefined,
    placeholder: string,
    title: string,
    className: string,
    opts?: { type?: string; min?: string; autoFocus?: boolean; list?: string },
  ) => (
    <input
      type={opts?.type ?? "text"}
      list={opts?.list}
      class={`input item-form-input ${className}${errors?.has(field) ? " input-error" : ""}`}
      value={value}
      disabled={!onChange}
      onInput={
        onChange
          ? (e) => onChange((e.target as HTMLInputElement).value)
          : undefined
      }
      placeholder={placeholder}
      title={title}
      autoFocus={opts?.autoFocus}
      min={opts?.min}
    />
  );

  return (
    <div class="item-form">
      <div class="item-form-fields">
        <span class="weapon-form-ammo">
          {inp("caliber", caliber, onCaliberChange, "Caliber", "Caliber (e.g. 9mm, .45)", "", { autoFocus, list: "caliber-suggestions" })}
          <datalist id="caliber-suggestions">
            {Object.keys(CALIBER_DAMAGE).map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </span>
        {inp("type", type, onTypeChange, "Type", "Ammo type (e.g. std, ap)", "weapon-form-type")}
        {inp("damage", damage, onDamageChange, "Damage", "Damage dice (e.g. 2D6+1)", "weapon-form-damage")}
        <Tip label="Cost per box (eb)" class="item-form-cost">
          {inp("cost", cost, onCostChange, "Cost", "Cost per box in eurobucks", "", { type: "number", min: "0" })}
        </Tip>
        <Tip label="Street availability" class="item-form-availability">
          <select
            class="input item-form-input"
            value={availability}
            disabled={!onAvailabilityChange}
            onChange={
              onAvailabilityChange
                ? (e) =>
                    onAvailabilityChange(
                      (e.target as HTMLSelectElement).value,
                    )
                : undefined
            }
            title="Street availability"
          >
            <option value="">Availability</option>
            {Object.entries(AVAILABILITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Tip>
      </div>
      <div class="ammo-form-bottom">
        <div class="ammo-form-half">
          <span class="text-desc">Effects</span>
          <textarea
            class={`input ammo-form-effects${errors?.has("effects") ? " input-error" : ""}`}
            value={effects}
            disabled={!onEffectsChange}
            onInput={
              onEffectsChange
                ? (e) =>
                    onEffectsChange((e.target as HTMLTextAreaElement).value)
                : undefined
            }
            placeholder="Effects"
            title="Special effects"
          />
        </div>
        <div class="ammo-form-half">
          <span class="text-desc">Description</span>
          <textarea
            class="input item-form-description"
            value={description}
            disabled={!onDescriptionChange}
            onInput={
              onDescriptionChange
                ? (e) =>
                    onDescriptionChange((e.target as HTMLTextAreaElement).value)
                : undefined
            }
            placeholder="No description"
            title="Description"
          />
        </div>
      </div>
    </div>
  );
}

// --- Main component ---

export default function BottomBarAmmo({ expanded, onToggle }: Props) {
  const ammoId = useStore($selectedAmmo);
  const adding = useStore($addingAmmo);
  const quantities = useStore($ownedAmmo);
  const customDefs = useStore($customAmmoItems);

  // Resolve: catalog or custom
  const catalogTemplate = ammoId ? AMMO_CATALOG[ammoId] ?? null : null;
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
          availability: customDef.availability ?? "C",
        }
      : null;

  const isCustom = ammoId ? !!customDef : false;
  const quantity = ammoId ? quantities[ammoId] ?? 0 : 0;

  // Edit toggle for custom ammo (view ↔ edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = isCustom && !!customDef && editingId === ammoId;

  // Add-mode form state
  const [newCaliber, setNewCaliber] = useState("");
  const [newType, setNewType] = useState("");
  const [newDamage, setNewDamage] = useState("");
  const damageAutoFilled = useRef(false);
  const handleCaliberChange = useCallback((cal: string) => {
    setNewCaliber(cal);
    const lookup = CALIBER_DAMAGE[cal] ?? CALIBER_DAMAGE[cal.toLowerCase()];
    if (lookup && (!newDamage || damageAutoFilled.current)) {
      setNewDamage(lookup);
      damageAutoFilled.current = true;
    }
  }, [newDamage]);
  const handleDamageChange = useCallback((v: string) => {
    damageAutoFilled.current = false;
    setNewDamage(v);
  }, []);
  const [newEffects, setNewEffects] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCost, setNewCost] = useState("");
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
    const cost = newCost ? Number(newCost) : undefined;
    const id = addCustomAmmo(cal, typ, {
      damage: dmg,
      effects: newEffects.trim(),
      description: newDescription.trim(),
      cost: cost != null && !isNaN(cost) ? cost : undefined,
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

  const displayName = resolved
    ? `${resolved.caliber} ${resolved.type}`
    : "";

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
        onCostChange={(v) => {
          const n = v ? Number(v) : undefined;
          updateCustomAmmo(ammoId!, {
            cost: n != null && !isNaN(n) ? n : 0,
          });
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
              setEditingId(editing ? null : ammoId);
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
