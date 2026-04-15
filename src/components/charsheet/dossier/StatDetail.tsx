import type { StatName, StatValues } from "@scripts/combat/types";
import { setStatCyber, setStatInherent } from "@stores/stats";

const STAT_DESCRIPTIONS: Record<StatName, string> = {
  int: "A measure of your problem solving ability; figuring out problems, noticing things, remembering information. Almost every character type will need a high Intelligence, with Netrunners and Corporates requiring the highest of all.",
  ref: "A combined index covering not only your basic dexterity, but also how your level of physical coordination will affect feats of driving, piloting, fighting and athletics. Characters who intend to engage in a great deal of combat should always invest in the highest possible Reflexes.",
  cl: "Measures how well the character stands up to stress, pressure, physical pain and/or torture. Essential for determining your willingness to fight on despite wounds or your fighting ability under fire. Also the measure of how \"together\" your character is and how tough he appears to others.",
  tech: "An index of how well you relate to hardware and other technically oriented things. The ability to use and repair technology is of paramount importance \u2014 TECH is the stat used when fixing, repairing and attempting to use unfamiliar tech.",
  lk: "The intangible \"something\" that throws the balance of events into your favor. Represents how many points you may use each game to influence the outcome of a critical event. Add any or all points to a critical die roll (declaring before the roll). Restored at the end of each game session.",
  att: "How good-looking you are. In Cyberpunk, it's not enough to be good \u2014 you have to look good while you're doing it. Especially important to Medias and Rockerboys, as being good-looking is part of their jobs.",
  ma: "An index of how fast your character can run, important in combat situations. The higher your MA, the more distance you can cover in a turn. RUN (meters/round) = MA \u00d7 3. LEAP (from running start) = RUN \u00f7 4.",
  emp: "How well you relate to other living things \u2014 a measure of charisma and sympathetic emotions. Critical when leading, convincing, seducing or perceiving emotional undercurrents. Also a measure of how close you are to the line between a feeling human being and a cold-blooded cyber-monster. For every 10 points of Humanity lost, you lose 1 EMP.",
  bt: "Strength, Endurance and Constitution are all based on Body Type. Determines how much damage you can take in wounds, how much you can lift or carry, how far you can throw, how well you recover from shock, and how much additional damage you cause with physical attacks.",
};

interface Props {
  name: StatName;
  values: StatValues;
}

const clamp = (num?: number) => Math.min(Math.max(num || 0, 0), 99);

export function StatDetail({ name, values }: Props) {
  // Placeholder: cyber bonus from $cyberEffects (will wire in M2)
  const cyberBonus = 0;

  return (
    <div class="stat-detail">
      <div class="detail-stats">
        <label class="detail-stat">
          <span class="detail-label">Base</span>
          <input
            type="number"
            class="stat-detail-input"
            value={values.inherent}
            min={0}
            max={20}
            onInput={(e) => {
              const v = clamp(parseInt(e.currentTarget.value, 10));
              setStatInherent(name, v);
            }}
          />
        </label>
        {cyberBonus !== 0 && (
          <span class="detail-stat">
            <span class="detail-label">Cyber</span>
            <span class="stat-detail-cyber">
              {cyberBonus > 0 ? `+${cyberBonus}` : cyberBonus}
            </span>
          </span>
        )}
        {values.penalties.length > 0 && (
          <span class="detail-stat">
            <span class="detail-label">Penalties</span>
            <span class="stat-detail-penalty">
              {values.penalties.join(" ")}
            </span>
          </span>
        )}
        <label class="detail-stat">
          <span class="detail-label">Bonus</span>
          <input
            type="number"
            class="stat-detail-input"
            value={values.cyber}
            min={-10}
            max={10}
            onInput={(e) => {
              const v = clamp(parseInt(e.currentTarget.value, 10));
              setStatCyber(name, v);
            }}
          />
        </label>
        <span class="detail-stat">
          <span class="detail-label">Current</span>
          <span
            class={`stat-detail-current${values.current < values.total ? " diminished" : ""}`}
          >
            {values.current}
          </span>
        </span>
      </div>
      <p class="text-desc">{STAT_DESCRIPTIONS[name]}</p>
    </div>
  );
}
