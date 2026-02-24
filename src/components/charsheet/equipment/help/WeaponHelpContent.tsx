export const WeaponHelpContent = () => {
  return (
    <>
      <h3>Weapon Mechanics</h3>
      <section>
        <h4>Attack Roll</h4>
        <p>
          To hit a target, roll <strong>1d10 + REF + Weapon Skill + WA</strong>.
          The weapon's <strong>WA</strong> (Weapon Accuracy) is a built-in
          accuracy modifier — positive for precise weapons, negative for
          inaccurate ones. Compare the total against the target's Difficulty
          Value, determined by range and other situational modifiers. If you
          meet or exceed the DV, you hit — roll damage and apply effects as
          normal.
        </p>
      </section>
      <details>
        <summary>Range Brackets</summary>
        <p>
          Range determines how hard it is to hit. All ranges are calculated from
          the weapon's <strong>maximum range</strong> stat.
        </p>
        <table>
          <thead>
            <tr>
              <th>Bracket</th>
              <th>Distance</th>
              <th>DV</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Point Blank</td>
              <td>&le; 1m</td>
              <td>10</td>
            </tr>
            <tr>
              <td>Close</td>
              <td>&le; &frac14; range</td>
              <td>15</td>
            </tr>
            <tr>
              <td>Medium</td>
              <td>&le; &frac12; range</td>
              <td>20</td>
            </tr>
            <tr>
              <td>Long</td>
              <td>&le; full range</td>
              <td>25</td>
            </tr>
            <tr>
              <td>Extreme</td>
              <td>&le; 2&times; range</td>
              <td>30</td>
            </tr>
          </tbody>
        </table>
        <p>
          At <strong>point blank</strong> with a gun pressed to the target, skip
          the roll — deal <strong>maximum damage</strong> instead.
        </p>
      </details>
      <details>
        <summary>Rate of Fire (RoF)</summary>
        <p>
          RoF is how many shots you can fire <strong>per turn</strong>. You can
          always choose to fire <strong>Single</strong> shots, but not more than
          your RoF allows.
        </p>
        <p>
          <strong>Three-round</strong> burst adds <strong>+3</strong> to your
          attack roll, but only works against single targets at medium range or
          closer — on success roll 1d6/3 to determine how many bullets hit (1-2:
          1 bullet, 3-4: 2 bullets, 5-6: all 3 bullets).
        </p>
        <p>
          <strong>Full-auto</strong> sprays at full RoF. Divide RoF by number of
          targets (round down). Roll attack as normal, +1 per 10 rounds at
          point-blank/close, -1 at all other ranges. Every point above the DV =
          one bullet hits. Calculate damage per bullet normally.
        </p>
        <p>
          <strong>Suppressive fire</strong> creates a fire zone. Save number =
          shots / zone width in meters. Enemies crossing must roll Athletics +
          REF + 1d10 over the save number or be hit with 1d6 rounds.
        </p>
      </details>
      <details>
        <summary>Reliability</summary>
        <p>
          When you roll a <strong>fumble</strong> (natural 1 on the attack die),
          roll again. Semi-auto follow the fumble table first, auto-weapons may
          jam right away — <em>Very Reliable</em> on 3 or lower,{" "}
          <em>Standard</em> {"<"}6, <em>Unreliable</em> {"<"}9. Jammed weapons
          take 1d6 turns to clear.
        </p>
      </details>
      <details>
        <summary>Concealability</summary>
        <p>
          How easy the weapon is to hide. <strong>P</strong> (Pocket) — easily
          hidden in a pocket or sleeve. <strong>J</strong> (Jacket) — fits under
          a jacket or coat. <strong>L</strong> (Longcoat) — hidden under a long
          coat, barely. <strong>N</strong> (No way) — visible no matter what.
        </p>
      </details>
      <details>
        <summary>Damage & Ammo Types</summary>
        <p>
          The weapon's damage depends on its <strong>caliber</strong>, which
          determines what <strong>ammunition</strong> it can fire. Damage and
          damage type depend on the ammo, not the weapon itself.
        </p>
      </details>
      <details>
        <summary>Smartguns</summary>
        <p>
          <strong>Smartchipped</strong> weapons connect to your neuralware
          interface, granting <strong>+2 WA</strong> — but only if you have the
          matching cyberware installed and connected. <em>Targeting scope</em>{" "}
          eyeware adds an additional +1. <em>SmartPlate weapon link</em> lets
          you use the smartgun link by simply holding the weapon, no wires
          required.
        </p>
      </details>
      <blockquote>
        "Everyone's got a gun. The trick is hitting something with it."
        <cite>— John Idaho, Lone Star Shooting Range CEO</cite>
      </blockquote>
    </>
  );
};
