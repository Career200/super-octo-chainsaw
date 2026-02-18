import { useState, useRef } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $selectedGear, $addingGear, selectGear } from "@stores/ui";
import {
  $ownedGear,
  $customGearItems,
  $customGear,
  addCustomGear,
  updateCustomGear,
  removeCustomGear,
  isCustomGear,
} from "@stores/gear";
import { GEAR_CATALOG, AVAILABILITY_LABELS } from "@scripts/gear/catalog";
import type { Availability } from "@scripts/gear/catalog";
import { Chevron } from "../shared/Chevron";
import { ConfirmPopover } from "../shared/ConfirmPopover";
import { Popover } from "../shared/Popover";

type AvailabilityWithEmpty = Availability | "";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

interface GearFormProps {
  disabled: boolean;
  name: string;
  onNameChange?: (v: string) => void;
  type: string;
  onTypeChange?: (v: string) => void;
  description: string;
  onDescriptionChange?: (v: string) => void;
  cost: string;
  onCostChange?: (v: string) => void;
  availability: string;
  onAvailabilityChange?: (v: AvailabilityWithEmpty) => void;
}

function GearForm({
  disabled,
  name,
  onNameChange,
  type,
  onTypeChange,
  description,
  onDescriptionChange,
  cost,
  onCostChange,
  availability,
  onAvailabilityChange,
}: GearFormProps) {
  return (
    <div class="gear-form">
      <div class="gear-form-fields">
        <label class="gear-form-field gear-form-name">
          <span class="gear-form-label">Name</span>
          <input
            type="text"
            class="input gear-form-input"
            value={name}
            disabled={disabled}
            onInput={
              onNameChange
                ? (e) => onNameChange((e.target as HTMLInputElement).value)
                : undefined
            }
            placeholder="Item name"
            autoFocus={!disabled}
          />
        </label>
        <label class="gear-form-field gear-form-type">
          <span class="gear-form-label">Type</span>
          <input
            type="text"
            class="input gear-form-input"
            value={type}
            disabled={!onTypeChange}
            onInput={
              onTypeChange
                ? (e) => onTypeChange((e.target as HTMLInputElement).value)
                : undefined
            }
            placeholder="e.g. gadgets, tools"
          />
        </label>
        <label class="gear-form-field gear-form-cost">
          <span class="gear-form-label">Cost</span>
          <input
            type="number"
            class="input gear-form-input"
            value={cost}
            disabled={!onCostChange}
            onInput={
              onCostChange
                ? (e) => onCostChange((e.target as HTMLInputElement).value)
                : undefined
            }
            placeholder="—"
            min="0"
          />
        </label>
        <label class="gear-form-field gear-form-availability">
          <span class="gear-form-label">Avail.</span>
          <select
            class="input gear-form-input"
            value={availability}
            disabled={!onAvailabilityChange}
            onChange={
              onAvailabilityChange
                ? (e) =>
                    onAvailabilityChange(
                      (e.target as HTMLSelectElement)
                        .value as AvailabilityWithEmpty,
                    )
                : undefined
            }
          >
            <option value="">—</option>
            {Object.entries(AVAILABILITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      <textarea
        class="input gear-form-description"
        value={description}
        disabled={!onDescriptionChange}
        onInput={
          onDescriptionChange
            ? (e) =>
                onDescriptionChange((e.target as HTMLTextAreaElement).value)
            : undefined
        }
        placeholder="No description"
      />
    </div>
  );
}

export const BottomBarEquipment = ({ expanded, onToggle }: Props) => {
  const gearId = useStore($selectedGear);
  const adding = useStore($addingGear);
  const ownedGear = useStore($ownedGear);
  const customGear = useStore($customGear);
  const customDefs = useStore($customGearItems);

  // Resolve selected item: check owned first, then custom defs, then catalog
  const resolved = gearId
    ? (ownedGear.find((i) => i.templateId === gearId) ??
      customGear.find((i) => i.templateId === gearId) ??
      (GEAR_CATALOG[gearId] ? { ...GEAR_CATALOG[gearId], quantity: 0 } : null))
    : null;

  const isCustom = gearId ? isCustomGear(gearId) : false;
  const hasCustomDef = gearId ? gearId in customDefs : false;

  // Add-mode form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newAvailability, setNewAvailability] =
    useState<AvailabilityWithEmpty>("");

  // Add button ref + error popover
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const [addError, setAddError] = useState<string | null>(null);

  // Remove confirmation
  const removeBtnRef = useRef<HTMLButtonElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const hasContent = !!(resolved && gearId) || adding;
  const headerLabel = adding ? "New custom item" : (resolved?.name ?? "");

  if (!hasContent) {
    return (
      <div class="bottom-bar-row">
        <span class="bottom-bar-hint">Select an item</span>
      </div>
    );
  }

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const cost = newCost ? Number(newCost) : undefined;
    if (
      addCustomGear(trimmed, {
        description: newDescription.trim(),
        type: newType.trim() || "gear",
        cost: cost != null && !isNaN(cost) ? cost : undefined,
        availability: newAvailability || "C",
      })
    ) {
      setNewName("");
      setNewType("");
      setNewDescription("");
      setNewCost("");
      setNewAvailability("");
      setAddError(null);
      selectGear(trimmed);
    } else {
      setAddError(`"${trimmed}" already exists`);
    }
  };

  const handleRemove = () => {
    removeCustomGear(gearId!);
    selectGear(null);
  };

  return (
    <>
      <div class="bottom-bar-row expandable" onClick={onToggle}>
        <div class="bottom-bar-content">
          <span class="bottom-bar-name">{headerLabel}</span>
        </div>
        <div class="bottom-bar-actions">
          {adding && (
            <>
              <button
                ref={addBtnRef}
                class="gear-bar-action"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd();
                }}
              >
                Add
              </button>
              <Popover
                anchorRef={addBtnRef}
                open={addError !== null}
                onClose={() => setAddError(null)}
                className="popover-info"
              >
                <p class="popover-message">{addError}</p>
              </Popover>
            </>
          )}
          {isCustom && !adding && (
            <>
              <button
                ref={removeBtnRef}
                class="gear-bar-action gear-bar-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmOpen(true);
                }}
              >
                Remove
              </button>
              <ConfirmPopover
                anchorRef={removeBtnRef}
                open={confirmOpen}
                message={`Remove ${resolved?.name}?`}
                confirmText="Remove"
                cancelText="Keep"
                type="danger"
                onConfirm={() => {
                  setConfirmOpen(false);
                  handleRemove();
                }}
                onCancel={() => setConfirmOpen(false)}
              />
            </>
          )}
          <Chevron expanded={expanded} />
        </div>
      </div>
      {expanded && (
        <div class="bottom-bar-body">
          {adding ? (
            <GearForm
              disabled={false}
              name={newName}
              onNameChange={setNewName}
              type={newType}
              onTypeChange={setNewType}
              description={newDescription}
              onDescriptionChange={setNewDescription}
              cost={newCost}
              onCostChange={setNewCost}
              availability={newAvailability}
              onAvailabilityChange={setNewAvailability}
            />
          ) : resolved ? (
            <GearForm
              disabled
              name={resolved.name}
              type={resolved.type}
              description={resolved.description}
              onDescriptionChange={
                isCustom && hasCustomDef
                  ? (v) => updateCustomGear(gearId!, { description: v })
                  : undefined
              }
              cost={resolved.cost != null ? String(resolved.cost) : ""}
              onCostChange={
                isCustom && hasCustomDef
                  ? (v) => {
                      const n = v ? Number(v) : undefined;
                      updateCustomGear(gearId!, {
                        cost: n != null && !isNaN(n) ? n : undefined,
                      });
                    }
                  : undefined
              }
              availability={resolved.availability ?? ""}
              onAvailabilityChange={
                isCustom && hasCustomDef
                  ? (v) =>
                      updateCustomGear(gearId!, {
                        availability: (v as Availability) || undefined,
                      })
                  : undefined
              }
              onTypeChange={
                isCustom && hasCustomDef
                  ? (v) => updateCustomGear(gearId!, { type: v })
                  : undefined
              }
            />
          ) : null}
        </div>
      )}
    </>
  );
};
