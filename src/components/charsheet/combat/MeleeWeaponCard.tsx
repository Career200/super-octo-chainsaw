import type { WeaponPiece } from "@stores/weapons";

interface Props {
  weapon: WeaponPiece;
  dmSign: string;
}

export const MeleeWeaponCard = ({ weapon, dmSign }: Props) => (
  <div class="combat-card">
    <div class="cc-header">
      <div class="cc-name">
        {weapon.name}
        {weapon.wa !== 0 && (
          <span class="cc-melee-wa"> WA {weapon.wa >= 0 ? "+" : ""}{weapon.wa}</span>
        )}
      </div>
      <span class="cc-hero-label">{weapon.reliability}</span>
    </div>
    <div class="cc-hero">
      <div class="cc-hero-cell">
        <span class="cc-hero-value">{weapon.damage} ({dmSign})</span>
      </div>
    </div>
    {weapon.effects && <div class="cc-effect">{weapon.effects}</div>}
  </div>
);
