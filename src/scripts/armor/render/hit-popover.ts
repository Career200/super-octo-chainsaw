import {
  BODY_PARTS,
  PART_ABBREV,
  PART_NAMES,
  getEffectiveSP,
  getImplantSP,
  type BodyPartName,
} from "../core";
import { DAMAGE_TYPE_OPTIONS, type DamageType } from "../damage-types";
import { applyHit } from "../hit";
import {
  getArmorPiece,
  getBodyPartLayers,
  getImplantsForPart,
} from "../../../stores/armor";
import {
  recordDamage,
  type ArmorDamageEntry,
} from "../../../stores/damage-history";
import { createPopover } from "../../ui/popover";
import {
  createSingleSelect,
  createMultiSelect,
  type SelectOption,
} from "../../ui/select";

const BODY_PART_OPTIONS: SelectOption<BodyPartName>[] = BODY_PARTS.map(
  (part) => ({
    value: part,
    label: PART_ABBREV[part],
  }),
);

const BODY_PART_GRID = `
  "all . head . none"
  ". left_arm torso right_arm ."
  ". left_leg ignoresp right_leg ."
`;

function createBodyPartSelector(): {
  element: HTMLElement;
  getSelected: () => BodyPartName[];
  isNoneSelected: () => boolean;
  isIgnoreSP: () => boolean;
} {
  let ignoreSP = false;

  const multiSelect = createMultiSelect<BodyPartName>({
    options: BODY_PART_OPTIONS,
    defaultValue: ["head"],
    showAllButton: true,
    allButtonLabel: "Full",
    showNoneButton: true,
    noneButtonLabel: "None",
    noneDeselectValue: "head",
    gridTemplateAreas: BODY_PART_GRID,
    allGridArea: "all",
    noneGridArea: "none",
    className: "hit-body-select",
  });

  const ignoreSPBtn = document.createElement("button");
  ignoreSPBtn.type = "button";
  ignoreSPBtn.className = "select-option select-option-ignoresp";
  ignoreSPBtn.textContent = "Ignore SP";
  ignoreSPBtn.title = "Bypass armor completely (fire, EMP, etc.)";
  ignoreSPBtn.style.gridArea = "ignoresp";
  ignoreSPBtn.addEventListener("click", () => {
    ignoreSP = !ignoreSP;
    ignoreSPBtn.classList.toggle("selected", ignoreSP);
  });

  const container = multiSelect.element.querySelector(".select-options");
  container?.appendChild(ignoreSPBtn);

  return {
    element: multiSelect.element,
    getSelected: () => multiSelect.getSelected(),
    isNoneSelected: () => multiSelect.isNoneSelected(),
    isIgnoreSP: () => ignoreSP,
  };
}

function createDamageTypeSelector() {
  return createSingleSelect<DamageType>({
    options: DAMAGE_TYPE_OPTIONS,
    defaultValue: "normal",
    showDescription: true,
  });
}

export function setupHitButton() {
  const btn = document.getElementById("btn-im-hit");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // Don't trigger panel collapse

    const { popover, cleanup, reposition } = createPopover(btn, {
      backdrop: true,
      className: "popover-danger popover-hit",
    });

    const selectorLabel = document.createElement("p");
    selectorLabel.className = "popover-message";
    selectorLabel.textContent = "Where?";

    const {
      element: selector,
      getSelected,
      isNoneSelected,
      isIgnoreSP,
    } = createBodyPartSelector();

    const typeLabel = document.createElement("p");
    typeLabel.className = "popover-message";
    typeLabel.textContent = "What hit you?";

    const { element: typeSelector, getSelected: getDamageType } =
      createDamageTypeSelector();

    const inputLabel = document.createElement("p");
    inputLabel.className = "popover-message";
    inputLabel.textContent = "Raw damage?";

    const input = document.createElement("input");
    input.type = "number";
    input.className = "popover-input";
    input.placeholder = "Damage";
    input.min = "0";

    const actions = document.createElement("div");
    actions.className = "popover-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "popover-btn popover-btn-cancel";
    cancelBtn.textContent = "Dismiss";
    cancelBtn.addEventListener("click", cleanup);

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "popover-btn popover-btn-confirm";
    confirmBtn.textContent = "Apply";
    confirmBtn.addEventListener("click", () => {
      const damage = parseInt(input.value, 10);
      const parts = getSelected();
      const damageType = getDamageType();
      const isNone = isNoneSelected();
      const ignoringArmor = isIgnoreSP();

      if (!isNaN(damage) && damage > 0 && (parts.length > 0 || isNone)) {
        const typeLabel =
          DAMAGE_TYPE_OPTIONS.find((o) => o.value === damageType)?.label ??
          damageType;

        if (isNone) {
          console.log(
            `[Non-locational] ${damage} ${typeLabel} damage → ${damage} penetrating`,
          );
          console.warn(`⚠️ CHARACTER TAKES ${damage} DAMAGE (non-locational)`);
          recordDamage({
            rawDamage: damage,
            damageType,
            bodyParts: "none",
            effectiveSP: 0,
            armorDamage: [],
            penetrating: damage,
            ignoredArmor: false,
          });
          cleanup();
          return;
        }

        for (const part of parts) {
          const partLabel = PART_NAMES[part];

          if (ignoringArmor) {
            console.log(
              `[${partLabel}] ${damage} ${typeLabel} damage → ${damage} penetrating (SP ignored)`,
            );
            console.warn(
              `⚠️ CHARACTER TAKES ${damage} DAMAGE TO ${partLabel.toUpperCase()}`,
            );
            recordDamage({
              rawDamage: damage,
              damageType,
              bodyParts: [part],
              effectiveSP: 0,
              armorDamage: [],
              penetrating: damage,
              ignoredArmor: true,
            });
            continue;
          }

          const layers = getBodyPartLayers(part);
          const implants = getImplantsForPart(part);

          const effectiveSP = getEffectiveSP(layers, { implants, part });
          const result = applyHit(part, damage);

          // Build armor damage entries for history
          const armorDamageEntries: ArmorDamageEntry[] = Array.from(
            result.degradation.entries(),
          ).map(([id, sp]) => {
            const armor = getArmorPiece(id);
            return {
              armorId: id,
              armorName: armor?.name ?? id,
              spLost: sp,
            };
          });

          // Add implant damage to history if penetrated
          if (result.penetrating > 0) {
            for (const impl of implants) {
              if (getImplantSP(impl, part) > 0) {
                armorDamageEntries.push({
                  armorId: impl.id,
                  armorName: impl.name,
                  spLost: 1,
                });
              }
            }
          }

          if (armorDamageEntries.length > 0) {
            const armorDamageStr = armorDamageEntries
              .map((e) => `${e.armorName}: -${e.spLost} SP`)
              .join(", ");
            console.log(
              `[${partLabel}] ${damage} ${typeLabel} damage → ${result.penetrating} penetrating | Armor: ${armorDamageStr}`,
            );
          } else {
            console.log(
              `[${partLabel}] ${damage} ${typeLabel} damage → ${result.penetrating} penetrating (no armor)`,
            );
          }

          if (result.penetrating > 0) {
            console.warn(
              `⚠️ CHARACTER TAKES ${result.penetrating} DAMAGE TO ${partLabel.toUpperCase()}`,
            );
          }

          // Find top protector (armor/implant with highest SP)
          const allProtectors = [
            ...layers.map((l) => ({ name: l.name, sp: l.spCurrent })),
            ...implants.map((i) => ({
              name: i.name,
              sp: getImplantSP(i, part),
            })),
          ]
            .filter((p) => p.sp > 0)
            .sort((a, b) => b.sp - a.sp);
          const topProtector = allProtectors[0]?.name;

          recordDamage({
            rawDamage: damage,
            damageType,
            bodyParts: [part],
            effectiveSP,
            topProtector,
            armorDamage: armorDamageEntries,
            penetrating: result.penetrating,
            ignoredArmor: false,
          });
        }
      }
      cleanup();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmBtn.click();
      }
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);

    popover.appendChild(selectorLabel);
    popover.appendChild(selector);
    popover.appendChild(typeLabel);
    popover.appendChild(typeSelector);
    popover.appendChild(inputLabel);
    popover.appendChild(input);
    popover.appendChild(actions);

    reposition();
    input.focus();
  });
}
