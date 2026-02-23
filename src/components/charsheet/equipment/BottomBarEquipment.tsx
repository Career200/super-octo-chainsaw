import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";

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

import { BottomBarItemShell } from "../common/bottombar/BottomBarItemShell";
import { Tip } from "../shared";
import { ItemForm } from "../shared/ItemForm";

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

  // Add-mode form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newAvailability, setNewAvailability] = useState<Availability | "">("");
  const [addAttempted, setAddAttempted] = useState(false);

  const handleAdd = (): string | null => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setAddAttempted(true);
      return "Name cannot be empty";
    }
    const typeVal = newType.trim() || "gear";
    if (/^armor$/i.test(typeVal)) return "Please use custom armor tab";
    const cost = newCost ? Number(newCost) : undefined;
    if (
      addCustomGear(trimmed, {
        description: newDescription.trim(),
        type: typeVal,
        cost: cost != null && !isNaN(cost) ? cost : undefined,
        availability: newAvailability || "C",
      })
    ) {
      setAddAttempted(false);
      setNewName("");
      setNewType("");
      setNewDescription("");
      setNewCost("");
      setNewAvailability("");
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
    addAttempted && !newName.trim() ? new Set<string>(["name"]) : undefined;

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
    >
      {adding ? (
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
          {typeField(newType, setNewType)}
        </ItemForm>
      ) : resolved ? (
        <ItemForm
          disabled
          name={resolved.name}
          onNameChange={
            isCustom && hasCustomDef
              ? (v) => {
                  if (renameCustomGear(gearId!, v)) selectGear(v);
                }
              : undefined
          }
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
        >
          {typeField(
            resolved.type,
            isCustom && hasCustomDef
              ? (v) => updateCustomGear(gearId!, { type: v })
              : undefined,
          )}
        </ItemForm>
      ) : null}
    </BottomBarItemShell>
  );
}
