import { STAT_LABELS } from "@scripts/combat/types";
import type { Maneuver, SkillStat } from "@scripts/skills/catalog";
import { MANEUVER_LABELS, MANEUVER_NAMES } from "@scripts/skills/catalog";

/** Read-only detail view for catalog skills */
export function SkillDetail({
  stat,
  diffMod,
  melee,
  martialArt,
  keyAttacks,
  description,
}: {
  stat: SkillStat;
  diffMod: number;
  melee: boolean;
  martialArt: boolean;
  keyAttacks: Partial<Record<Maneuver, number>>;
  description: string;
}) {
  const activeAttacks = martialArt
    ? MANEUVER_NAMES.filter((m) => keyAttacks[m])
    : [];

  return (
    <div class="skill-detail">
      <div class="detail-stats">
        <span class="detail-stat">
          <span class="detail-label">Stat</span>
          {STAT_LABELS[stat as keyof typeof STAT_LABELS] ?? "SPECIAL"}
        </span>
        <span class="detail-stat">
          <span class="detail-label">Diff</span>x{diffMod}
        </span>
        {melee && (
          <span class="detail-stat">
            <span class="detail-label">Melee</span>
            Yes
          </span>
        )}
        {martialArt && (
          <span class="detail-stat">
            <span class="detail-label">MA</span>
            Yes
          </span>
        )}
      </div>
      {activeAttacks.length > 0 && (
        <div class="detail-stats">
          {activeAttacks.map((m) => (
            <span key={m} class="detail-stat">
              <span class="detail-label">{MANEUVER_LABELS[m]}</span>+
              {keyAttacks[m]}
            </span>
          ))}
        </div>
      )}
      {description && <p class="text-desc">{description}</p>}
    </div>
  );
}
