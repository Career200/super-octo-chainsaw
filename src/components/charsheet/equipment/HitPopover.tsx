import { useState, useRef, useEffect } from "preact/hooks";
import {
  BODY_PARTS,
  PART_ABBREV,
  PART_NAMES,
  getEffectiveSP,
  getImplantSP,
  type BodyPartName,
} from "@scripts/armor/core";
import {
  DAMAGE_TYPE_OPTIONS,
  type DamageType,
} from "@scripts/armor/damage-types";
import { applyHit } from "@scripts/armor/hit";
import {
  getArmorPiece,
  getBodyPartLayers,
  getImplantsForPart,
} from "@stores/armor";
import { $bodyType } from "@stores/stats";
import { takeDamage } from "@stores/health";
import { recordDamage, type ArmorDamageEntry } from "@stores/damage-history";
import { Popover } from "../shared/Popover";

const BODY_PART_GRID = `
  "face head ignoresp"
  "left_arm torso right_arm"
  "left_leg . right_leg"
`;

export const HitPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<BodyPartName | null>("head");
  const [damageType, setDamageType] = useState<DamageType>("normal");
  const [damage, setDamage] = useState("");
  const [dieType, setDieType] = useState<null | 6 | 10>(null);
  const [ignoreSP, setIgnoreSP] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus damage input after popover renders
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const reset = () => {
    setSelectedPart("head");
    setDamageType("normal");
    setDamage("");
    setDieType(null);
    setIgnoreSP(false);
  };

  const close = () => {
    setIsOpen(false);
    reset();
  };

  const handleApply = () => {
    const raw = parseInt(damage, 10);
    if (isNaN(raw) || raw <= 0) return;

    let dmg: number;
    let diceRolls: number[] | undefined;
    if (dieType) {
      diceRolls = Array.from({ length: raw }, () => Math.floor(Math.random() * dieType) + 1);
      dmg = diceRolls.reduce((a, b) => a + b, 0);
    } else {
      dmg = raw;
    }

    const btm = $bodyType.get().btm;

    if (selectedPart === null) {
      const woundDamage = Math.max(1, dmg - btm);
      takeDamage(woundDamage, "physical");
      recordDamage({
        rawDamage: dmg,
        damageType,
        bodyParts: "none",
        effectiveSP: 0,
        armorDamage: [],
        penetrating: dmg,
        ignoredArmor: false,
        btm,
        woundDamage,
        diceRolls,
      });
      close();
      return;
    }

    const part = selectedPart;

    if (ignoreSP) {
      const isHeadOrFace = part === "head" || part === "face";
      const afterBTM = Math.max(1, dmg - btm);
      const woundDamage = isHeadOrFace ? afterBTM * 2 : afterBTM;
      takeDamage(woundDamage, "physical");
      recordDamage({
        rawDamage: dmg,
        damageType,
        bodyParts: [part],
        effectiveSP: 0,
        armorDamage: [],
        penetrating: dmg,
        ignoredArmor: true,
        headMultiplied: isHeadOrFace,
        btm,
        woundDamage,
        diceRolls,
      });
      close();
      return;
    }

    const layers = getBodyPartLayers(part);
    const implants = getImplantsForPart(part);
    const effectiveSP = getEffectiveSP(layers, { implants, part });
    const result = applyHit(part, dmg);

    const armorDamageEntries: ArmorDamageEntry[] = Array.from(
      result.degradation.entries(),
    ).map(([id, sp]) => {
      const armor = getArmorPiece(id);
      return { armorId: id, armorName: armor?.shortName ?? armor?.name ?? id, spLost: sp };
    });

    if (result.penetrating > 0) {
      for (const impl of implants) {
        if (getImplantSP(impl, part) > 0) {
          armorDamageEntries.push({
            armorId: impl.id,
            armorName: impl.shortName ?? impl.name,
            spLost: 1,
          });
        }
      }
    }

    const allProtectors = [
      ...layers.map((l) => ({ name: l.shortName ?? l.name, sp: l.spCurrent })),
      ...implants.map((i) => ({ name: i.shortName ?? i.name, sp: getImplantSP(i, part) })),
    ]
      .filter((p) => p.sp > 0)
      .sort((a, b) => b.sp - a.sp);

    let woundDamage: number | undefined;
    let headMultiplied = false;

    if (result.penetrating > 0) {
      const isHeadOrFace = part === "head" || part === "face";
      headMultiplied = isHeadOrFace;
      const afterBTM = Math.max(1, result.penetrating - btm);
      woundDamage = isHeadOrFace ? afterBTM * 2 : afterBTM;
      takeDamage(woundDamage, "physical");
    }

    recordDamage({
      rawDamage: dmg,
      damageType,
      bodyParts: [part],
      effectiveSP,
      topProtector: allProtectors[0]?.name,
      armorDamage: armorDamageEntries,
      penetrating: result.penetrating,
      ignoredArmor: false,
      headMultiplied: headMultiplied || undefined,
      btm,
      woundDamage,
      diceRolls,
    });

    close();
  };

  const selectedTypeOption = DAMAGE_TYPE_OPTIONS.find(
    (o) => o.value === damageType,
  );

  return (
    <>
      <button
        ref={triggerRef}
        class="btn-outline-danger btn-md"
        onClick={(e: Event) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        I'm hit
      </button>
      <Popover
        anchorRef={triggerRef}
        open={isOpen}
        onClose={close}
        className="popover-danger popover-hit"
      >
        <p class="popover-message popover-message-split">
          <span>Where?</span>
          <span class="popover-hint">deselect for non-locational</span>
        </p>
        <div class="select-wrapper hit-body-select">
          <div
            class="select-options"
            style={{
              display: "grid",
              gridTemplateAreas: BODY_PART_GRID,
              gap: "4px",
            }}
          >
            {BODY_PARTS.map((part) => (
              <button
                key={part}
                type="button"
                class={`select-option${selectedPart === part ? " selected" : ""}`}
                style={{ gridArea: part }}
                onClick={() =>
                  setSelectedPart(selectedPart === part ? null : part)
                }
              >
                {PART_ABBREV[part]}
              </button>
            ))}
            <button
              type="button"
              class={`select-option select-option-ignoresp${ignoreSP ? " selected" : ""}`}
              style={{ gridArea: "ignoresp" }}
              title="Bypass armor completely (fire, EMP, etc.)"
              onClick={() => setIgnoreSP(!ignoreSP)}
            >
              Ignore SP
            </button>
          </div>
        </div>
        <p class="popover-message">What hit you?</p>
        <div class="select-wrapper">
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
        </div>
        <p class="popover-message">Raw damage?</p>
        <div class="hit-damage-row">
          <input
            ref={inputRef}
            type="number"
            class="popover-input"
            placeholder={dieType ? `${dieType === 6 ? "d6" : "d10"} count` : "Damage"}
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
