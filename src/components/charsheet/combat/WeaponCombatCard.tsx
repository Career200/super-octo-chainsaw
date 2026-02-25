import { useRef, useState } from "preact/hooks";

import { flashElement } from "@scripts/flash";
import { WEAPON_TYPE_LABELS } from "@scripts/weapons/catalog";
import type { WeaponPiece } from "@stores/weapons";
import { fireWeapon, reloadWeapon, setCurrentAmmo } from "@stores/weapons";

import { Popover } from "../shared/Popover";

interface RangeEntry {
  label: string;
  distance: string;
  dc: number;
}

function getRangeTable(range: number): RangeEntry[] {
  return [
    { label: "PB", distance: "<1m", dc: 10 },
    { label: "Close", distance: `${Math.round(range / 4)}m`, dc: 15 },
    { label: "Med", distance: `${Math.round(range / 2)}m`, dc: 20 },
    { label: "Long", distance: `${range}m`, dc: 25 },
    { label: "Extreme", distance: `${range * 2}m`, dc: 30 },
  ];
}

interface Props {
  weapon: WeaponPiece;
  refCurrent: number;
  skillLevel: number;
  skillName: string;
}
const CC_FLASH = ["cc-flash-1", "cc-flash-3", "cc-flash-5", "cc-flash-reload"];

/**
 * Potentially we can generate and write to history
 */
export const WeaponCombatCard = ({
  weapon,
  refCurrent,
  skillLevel,
  skillName,
}: Props) => {
  const [ammoOpen, setAmmoOpen] = useState(false);
  const [ammoVal, setAmmoVal] = useState(0);
  const ammoRef = useRef<HTMLButtonElement>(null);

  const total = refCurrent + skillLevel + weapon.wa;

  const handleAmmoOpen = () => {
    setAmmoVal(weapon.currentAmmo);
    setAmmoOpen(true);
  };

  const handleAmmoApply = () => {
    setCurrentAmmo(weapon.id, ammoVal);
    setAmmoOpen(false);
  };

  const cardRef = useRef<HTMLDivElement>(null);

  const flash = (cls: string) =>
    flashElement(cardRef.current, cls, { color: "var(--warning-hot)", clearClasses: CC_FLASH });

  const handleReload = () => {
    reloadWeapon(weapon.id);
    setAmmoOpen(false);
    flash("cc-flash-reload");
  };

  const handleFire = (shots: number) => {
    fireWeapon(weapon.id, shots);
    flash(
      shots === 1 ? "cc-flash-1" : shots <= 3 ? "cc-flash-3" : "cc-flash-5",
    );
  };

  return (
    <div
      ref={cardRef}
      class="combat-card"
    >
      {/* Header: name + ammo */}
      <div class="cc-header">
        <div class="cc-name">
          <span class="cc-type">{WEAPON_TYPE_LABELS[weapon.type]}</span>
          {weapon.name}
          {weapon.ammo && <span class="cc-caliber"> ({weapon.ammo})</span>}
        </div>
        {!weapon.melee && weapon.shots > 0 && (
          <button
            ref={ammoRef}
            class="btn-ghost cc-ammo-btn"
            onClick={handleAmmoOpen}
          >
            {weapon.currentAmmo}/{weapon.shots}
          </button>
        )}
      </div>

      {/* Hero row: damage | RoF | skill = total */}
      <div class="cc-hero">
        <div class="cc-hero-cell">
          <span class="cc-hero-value">{weapon.damage}</span>
        </div>
        {!weapon.melee && (
          <div class="cc-hero-cell">
            <span class="cc-hero-label">RoF</span>
            <span class="cc-hero-value">{weapon.rof}</span>
          </div>
        )}
        <div class="cc-hero-cell cc-hero-skill">
          <span class="cc-hero-total">+{total} </span>
          <span class="cc-hero-formula">
            (REF {refCurrent} + {skillName} {skillLevel}
            {weapon.wa !== 0 && (
              <>
                {" "}
                ({weapon.wa >= 0 ? "+" : ""}
                {weapon.wa})
              </>
            )}
            )
          </span>
        </div>
        <div class="cc-hero-cell">
          <span class="cc-hero-value">{weapon.reliability}</span>
        </div>
      </div>

      {/* Range/DC table (ranged only) */}
      {!weapon.melee && weapon.range > 0 && (
        <div class="cc-range">
          {getRangeTable(weapon.range).map((e) => (
            <div key={e.label} class="cc-range-col">
              <span class="cc-range-label">
                {e.label} {e.dc}
              </span>
              <span class="cc-range-distance">{e.distance}</span>
            </div>
          ))}
        </div>
      )}

      {/* Fire buttons / empty mag warning (ranged only) */}
      {!weapon.melee && weapon.shots > 0 && (
        <div class="cc-fire">
          {weapon.currentAmmo > 0 ? (
            <>
              <button
                class="btn-ghost cc-fire-btn"
                onClick={() => handleFire(1)}
              >
                Fire 1
              </button>
              {weapon.rof >= 3 && (
                <button
                  class="btn-ghost cc-fire-btn"
                  onClick={() => handleFire(3)}
                  disabled={weapon.currentAmmo < 3}
                >
                  Fire 3
                </button>
              )}
              {weapon.rof >= 10 && (
                <button
                  class="btn-ghost cc-fire-btn"
                  onClick={() => handleFire(weapon.rof)}
                  disabled={weapon.currentAmmo < weapon.rof}
                >
                  Full Auto ({weapon.rof})
                </button>
              )}
            </>
          ) : (
            <span class="cc-empty-mag">Mag empty — reload</span>
          )}
        </div>
      )}

      {/* Ammo popover (repair-style stepper) */}
      {!weapon.melee && weapon.shots > 0 && (
        <Popover
          anchorRef={ammoRef}
          open={ammoOpen}
          onClose={() => setAmmoOpen(false)}
        >
          <div class="flex-center gap-12 cc-ammo-stepper">
            <button
              type="button"
              class="btn-ghost btn-icon"
              onClick={() => setAmmoVal(0)}
            >
              0
            </button>
            <button
              type="button"
              class="btn-ghost btn-icon"
              disabled={ammoVal <= 0}
              onClick={() => setAmmoVal(ammoVal - 1)}
            >
              −
            </button>
            <span class="text-value-2xl cc-ammo-value">{ammoVal}</span>
            <button
              type="button"
              class="btn-ghost btn-icon"
              disabled={ammoVal >= weapon.shots}
              onClick={() => setAmmoVal(ammoVal + 1)}
            >
              +
            </button>
            <button
              type="button"
              class="btn-ghost btn-icon"
              onClick={() => setAmmoVal(weapon.shots)}
            >
              {weapon.shots}
            </button>
          </div>
          <div class="popover-actions">
            <button
              class="popover-btn popover-btn-cancel"
              onClick={() => setAmmoOpen(false)}
            >
              Dismiss
            </button>
            <button
              class="popover-btn popover-btn-confirm"
              onClick={handleReload}
            >
              Reload
            </button>
            <button
              class="popover-btn popover-btn-confirm"
              onClick={handleAmmoApply}
            >
              Apply
            </button>
          </div>
        </Popover>
      )}
    </div>
  );
};
