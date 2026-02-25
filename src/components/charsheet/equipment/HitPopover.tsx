import type { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

import type { BodyPartName } from "@scripts/armor/core";
import {
  DAMAGE_TYPE_OPTIONS,
  type DamageType,
} from "@scripts/armor/damage-types";
import {
  resolveLocationalHit,
  resolveNonLocationalHit,
  rollHitLocation,
} from "@scripts/armor/hit";
import { flashElement } from "@scripts/flash";

import { Popover } from "../shared/Popover";

let lastInputs = {
  damageType: "normal" as DamageType,
  damage: "",
  dieType: null as null | 6 | 10,
  bonus: "",
};

interface Props {
  forPart?: BodyPartName;
  children?: ComponentChildren;
}

export const HitPopover = ({ forPart, children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [damageType, setDamageType] = useState<DamageType>("normal");
  const [damage, setDamage] = useState("");
  const [dieType, setDieType] = useState<null | 6 | 10>(null);
  const [bonus, setBonus] = useState("");
  const [ignoreSP, setIgnoreSP] = useState(false);
  const [rollLocation, setRollLocation] = useState(true);
  const [shotCount, setShotCount] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDamageType(lastInputs.damageType);
      setDamage(lastInputs.damage);
      setDieType(lastInputs.dieType);
      setBonus(lastInputs.bonus);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const reset = () => {
    setIgnoreSP(false);
    setRollLocation(true);
    setShotCount("");
  };

  const close = () => {
    setIsOpen(false);
    reset();
  };

  const handleApply = () => {
    const raw = parseInt(damage) || (dieType ? 1 : 0);
    if (raw <= 0) return;

    // Snapshot all state before close() resets it
    const snap = { damageType, dieType, bonus, ignoreSP, rollLocation };
    const count = parseInt(shotCount) || 1;
    lastInputs = { damageType, damage, dieType, bonus };
    close();

    const flat = snap.dieType ? parseInt(snap.bonus) || 0 : 0;

    const rollOnce = () => {
      let dmg: number;
      let diceRolls: number[] | undefined;
      if (snap.dieType) {
        diceRolls = Array.from(
          { length: raw },
          () => Math.floor(Math.random() * snap.dieType!) + 1,
        );
        if (flat) diceRolls.push(flat);
        dmg = diceRolls.reduce((a, b) => a + b, 0);
      } else {
        dmg = raw;
      }
      return { dmg, diceRolls };
    };

    const fireOnce = () => {
      const { dmg, diceRolls } = rollOnce();
      const part = forPart ?? (snap.rollLocation ? rollHitLocation() : null);
      if (part) {
        resolveLocationalHit(part, dmg, {
          damageType: snap.damageType,
          ignoreSP: snap.ignoreSP,
          diceRolls,
        });
        flashElement(document.getElementById(`part-${part}`), "bp-flash", {
          color: "var(--danger)",
        });
      } else {
        resolveNonLocationalHit(dmg, {
          damageType: snap.damageType,
          diceRolls,
        });
      }
    };

    for (let i = 0; i < count; i++) {
      setTimeout(fireOnce, i * 500);
    }
  };

  const selectedTypeOption = DAMAGE_TYPE_OPTIONS.find(
    (o) => o.value === damageType,
  );

  return (
    <>
      <button
        ref={triggerRef}
        class="btn-ghost hit-badge"
        onClick={(e: Event) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        {children ?? "I'm hit"}
      </button>
      <Popover
        anchorRef={triggerRef}
        open={isOpen}
        onClose={close}
        className="popover-danger popover-hit"
      >
        {!forPart && (
          <p class="popover-hint hit-hint">
            Know where you're hit? Use the red badges on body parts.
          </p>
        )}
        <div class="select-options" style={{ marginBottom: "var(--space-8)" }}>
          {!forPart && (
            <button
              type="button"
              class={`select-option${rollLocation ? " selected" : ""}`}
              onClick={() => setRollLocation(!rollLocation)}
            >
              Roll location
            </button>
          )}
          <button
            type="button"
            class={`select-option select-option-ignoresp${ignoreSP || (!forPart && !rollLocation) ? " selected" : ""}`}
            title="Bypass armor completely (fire, EMP, etc.)"
            disabled={!forPart && !rollLocation}
            onClick={() => setIgnoreSP(!ignoreSP)}
          >
            Ignore SP
          </button>
        </div>
        <p class="popover-message">What hit you?</p>
        <div class="select-options">
          {DAMAGE_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              class={`select-option${damageType === opt.value ? " selected" : ""}`}
              onClick={() => setDamageType(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {selectedTypeOption?.description && (
          <p class="select-description">{selectedTypeOption.description}</p>
        )}
        <p class="popover-message hit-damage-header">
          Raw damage?
          <input
            type="number"
            class="popover-input hit-shot-count"
            placeholder="x times"
            min="1"
            value={shotCount}
            onInput={(e) => setShotCount((e.target as HTMLInputElement).value)}
          />
        </p>
        <div class="hit-damage-row">
          <input
            ref={inputRef}
            type="number"
            class="popover-input"
            placeholder={
              dieType ? `${dieType === 6 ? "d6" : "d10"} count` : "Damage"
            }
            min="1"
            value={damage}
            onInput={(e) => setDamage((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
          />
          <button
            type="button"
            class={`select-option${dieType === 6 ? " selected" : ""}`}
            onClick={() => setDieType(dieType === 6 ? null : 6)}
          >
            d6
          </button>
          <button
            type="button"
            class={`select-option${dieType === 10 ? " selected" : ""}`}
            onClick={() => setDieType(dieType === 10 ? null : 10)}
          >
            d10
          </button>
          <span class={`hit-bonus${dieType ? "" : " hit-bonus-disabled"}`}>
            +
            <input
              type="number"
              class="popover-input"
              placeholder="0"
              min="0"
              value={bonus}
              disabled={!dieType}
              onInput={(e) => setBonus((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApply();
                }
              }}
            />
          </span>
        </div>
        <div class="popover-actions">
          <button class="popover-btn popover-btn-cancel" onClick={close}>
            Dismiss
          </button>
          <button class="popover-btn popover-btn-confirm" onClick={handleApply}>
            Apply
          </button>
        </div>
      </Popover>
    </>
  );
};
