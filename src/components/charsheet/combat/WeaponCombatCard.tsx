import { useStore } from "@nanostores/preact";
import { useRef, useState } from "preact/hooks";

import { flashElement } from "@scripts/flash";
import { WEAPON_TYPE_LABELS } from "@scripts/weapons/catalog";
import { $ammoByCaliberLookup, addAmmo, removeAmmo } from "@stores/ammo";
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
  const ammoRef = useRef<HTMLButtonElement>(null);

  const ammoLookup = useStore($ammoByCaliberLookup);
  const caliberAmmo = weapon.ammo ? (ammoLookup[weapon.ammo] ?? []) : [];
  const hasReserves = caliberAmmo.length > 0;
  const loadedReserves = weapon.loadedAmmo
    ? (caliberAmmo.find((a) => a.templateId === weapon.loadedAmmo!.templateId)
        ?.quantity ?? 0)
    : 0;
  const stepperMax = weapon.loadedAmmo
    ? Math.min(weapon.shots, weapon.currentAmmo + loadedReserves)
    : weapon.shots;

  const total = refCurrent + skillLevel + weapon.wa;

  const handleAmmoOpen = () => setAmmoOpen(true);

  const adjustAmmo = (newVal: number) => {
    const clamped = Math.max(0, Math.min(stepperMax, newVal));
    if (clamped === weapon.currentAmmo) return;
    if (weapon.loadedAmmo) {
      const delta = clamped - weapon.currentAmmo;
      if (delta > 0) {
        removeAmmo(weapon.loadedAmmo.templateId, delta);
      } else {
        addAmmo(weapon.loadedAmmo.templateId, -delta);
      }
    }
    setCurrentAmmo(weapon.id, clamped);
  };

  const cardRef = useRef<HTMLDivElement>(null);

  const flash = (cls: string) =>
    flashElement(cardRef.current, cls, {
      color: "var(--warning-hot)",
      clearClasses: CC_FLASH,
    });

  const handleSelectAmmoType = (templateId: string) => {
    const ok = reloadWeapon(weapon.id, templateId);
    if (ok) flash("cc-flash-reload");
  };

  const handleReload = () => {
    const ok = reloadWeapon(
      weapon.id,
      weapon.loadedAmmo?.templateId ?? undefined,
    );
    if (!ok) return;
    flash("cc-flash-reload");
  };

  const handleFire = (shots: number) => {
    fireWeapon(weapon.id, shots);
    flash(
      shots === 1 ? "cc-flash-1" : shots <= 3 ? "cc-flash-3" : "cc-flash-5",
    );
  };

  return (
    <div ref={cardRef} class="combat-card">
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
            {weapon.loadedAmmo && (
              <span class="cc-ammo-type">{weapon.loadedAmmo.type}</span>
            )}
            {weapon.currentAmmo}/{weapon.shots}
          </button>
        )}
      </div>

      {/* Hero row: damage | RoF | skill = total */}
      <div class="cc-hero">
        <div class="cc-hero-cell">
          <span class="cc-hero-value">
            {weapon.loadedAmmo?.damage ?? weapon.damage}
          </span>
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

      {/* Effects row (loaded ammo only) */}
      {weapon.loadedAmmo?.effects && (
        <div class="cc-effect">{weapon.loadedAmmo.effects}</div>
      )}

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
          {weapon.loadedAmmo && (
            <p class="cc-reload-loaded">
              Loaded: {weapon.loadedAmmo.type} ({weapon.currentAmmo}/
              {weapon.shots})
            </p>
          )}
          <div class="flex-center gap-12 cc-ammo-stepper">
            <button
              type="button"
              class="btn-ghost btn-icon"
              disabled={weapon.currentAmmo <= 0}
              onClick={() => adjustAmmo(0)}
            >
              0
            </button>
            <button
              type="button"
              class="btn-ghost btn-icon"
              disabled={weapon.currentAmmo <= 0}
              onClick={() => adjustAmmo(weapon.currentAmmo - 1)}
            >
              −
            </button>
            <span class="text-value-2xl cc-ammo-value">
              {weapon.currentAmmo}
            </span>
            <button
              type="button"
              class="btn-ghost btn-icon"
              disabled={weapon.currentAmmo >= stepperMax}
              onClick={() => adjustAmmo(weapon.currentAmmo + 1)}
            >
              +
            </button>
            <button
              type="button"
              class="btn-ghost btn-icon"
              disabled={weapon.currentAmmo >= stepperMax}
              onClick={() => adjustAmmo(stepperMax)}
            >
              {stepperMax}
            </button>
          </div>
          {hasReserves ? (
            <>
              <p class="cc-reload-label">Ammo type</p>
              <div class="cc-reload-options">
                {caliberAmmo.map((a) => (
                  <button
                    key={a.templateId}
                    type="button"
                    class={`cc-reload-option${weapon.loadedAmmo?.templateId === a.templateId ? " selected" : ""}`}
                    onClick={() => handleSelectAmmoType(a.templateId)}
                  >
                    <span>{a.type}</span>
                    <span class="cc-reload-option-qty">{a.quantity}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p class="cc-reload-hint">No reserves — free reload</p>
          )}
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
              disabled={hasReserves && !weapon.loadedAmmo}
            >
              Reload
            </button>
          </div>
        </Popover>
      )}
    </div>
  );
};
