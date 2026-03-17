import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";

import { BottomBarItemShell } from "@components/charsheet/common/bottombar/BottomBarItemShell";
import {
  parseNum,
  Tip,
  useEditToggle,
  useFormState,
} from "@components/charsheet/shared";
import { ItemForm } from "@components/charsheet/shared/ItemForm";
import type { Availability } from "@scripts/gear/catalog";
import { GEAR_CATALOG } from "@scripts/gear/catalog";
import {
  $customGear,
  $customGearItems,
  $ownedGear,
  addCustomGear,
  isCustomGear,
  removeCustomGear,
  renameCustomGear,
  updateCustomGear,
} from "@stores/gear";
import { $addingGear, $selectedGear, selectGear } from "@stores/ui";

import { GearDetail } from "./GearDetail";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export default function BottomBarEquipment({ expanded, onToggle }: Props) {
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
  const isOwned = !!resolved && ownedGear.some((i) => i.templateId === gearId);

  // Edit-in-place for owned custom items (auto-resets on selection change)
  const { editing, toggleEdit } = useEditToggle(
    gearId,
    isOwned && isCustom && hasCustomDef,
  );

  // Add-mode form state
  const { fields: f, setField, reset } = useFormState({
    name: "",
    type: "",
    description: "",
    cost: "",
    availability: "" as Availability | "",
  });
  const [addAttempted, setAddAttempted] = useState(false);

  const handleAdd = (): string | null => {
    const trimmed = f.name.trim();
    if (!trimmed) {
      setAddAttempted(true);
      return "Name cannot be empty";
    }
    const typeVal = f.type.trim() || "gear";
    if (/^armor$/i.test(typeVal)) return "Please use custom armor tab";
    if (
      addCustomGear(trimmed, {
        description: f.description.trim(),
        type: typeVal,
        cost: f.cost ? parseNum(f.cost, 0) : undefined,
        availability: f.availability || "C",
      })
    ) {
      setAddAttempted(false);
      reset();
      selectGear(trimmed);
      return null;
    }
    return `"${trimmed}" already exists`;
  };

  const handleRemove = () => {
    removeCustomGear(gearId!);
    selectGear(null);
  };

  const typeField = (value: string, onChange?: (v: string) => void) => (
    <Tip label="Item type" class="item-form-type">
      <input
        type="text"
        class="input item-form-input"
        value={value}
        disabled={!onChange}
        onInput={
          onChange
            ? (e) => onChange((e.target as HTMLInputElement).value)
            : undefined
        }
        placeholder="Type"
        title="Item type"
      />
    </Tip>
  );

  const addErrors =
    addAttempted && !f.name.trim() ? new Set<string>(["name"]) : undefined;

  return (
    <BottomBarItemShell
      expanded={expanded}
      onToggle={onToggle}
      headerLabel={adding ? "New custom item" : (resolved?.name ?? "")}
      hasContent={!!(resolved && gearId) || adding}
      hintText="Select an item"
      adding={adding}
      onAdd={handleAdd}
      isCustom={isCustom}
      removeName={resolved?.name}
      onRemove={handleRemove}
      headerActions={
        isOwned && isCustom && hasCustomDef ? (
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
      {adding ? (
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
          {typeField(f.type, (v) => setField("type", v))}
        </ItemForm>
      ) : resolved && isCustom && hasCustomDef && (!isOwned || editing) ? (
        <ItemForm
          disabled
          name={resolved.name}
          onNameChange={(v) => {
            if (renameCustomGear(gearId!, v)) selectGear(v);
          }}
          description={resolved.description}
          onDescriptionChange={(v) =>
            updateCustomGear(gearId!, { description: v })
          }
          cost={resolved.cost != null ? String(resolved.cost) : ""}
          onCostChange={(v) =>
            updateCustomGear(gearId!, {
              cost: v ? parseNum(v, 0) : undefined,
            })
          }
          availability={resolved.availability ?? ""}
          onAvailabilityChange={(v) =>
            updateCustomGear(gearId!, {
              availability: (v as Availability) || undefined,
            })
          }
        >
          {typeField(resolved.type, (v) =>
            updateCustomGear(gearId!, { type: v }),
          )}
        </ItemForm>
      ) : resolved ? (
        <GearDetail item={resolved} />
      ) : null}
    </BottomBarItemShell>
  );
}
