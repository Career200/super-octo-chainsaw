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
      <blockquote>
        "Everyone's got a gun. The trick is hitting something with it."
        <cite>— John Idaho, Lone Star Shooting Range CEO</cite>
      </blockquote>
      <section>
        <h4>Range Brackets</h4>
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
      </section>
      <section>
        <h4>Rate of Fire (RoF)</h4>
        <p>
          RoF is how many shots you can fire <strong>per turn</strong>. You can
          always choose to fire <strong>Single</strong> shots, but not more than
          your RoF allows.
          <br />
          <strong>Three-round</strong> burst adds <strong>+3</strong> to your
          attack roll, but only works against single targets at medium range or
          closer - on success roll 1d6/3 to determine how many bullets hit (1-2:
          1 bullet, 3-4: 2 bullets, 5-6: all 3 bullets).
          <br />
          <strong>Full-auto</strong> on automatic weapons sprays wildly at full
          RoF:
          <br /> <strong>1.</strong> Decide how many targets you want to attack
          - for multiple targets, divide your RoF by the number of targets,
          round down.
          <i>
            <strong>Ask your GM</strong>, but I consider the spray unbroken, so
            if you attack two targets two meters apart, you treat each meter
            between targets as a separate target - so you divide RoF by 4.
          </i>
          <br /> <strong>2.</strong> For each target, make an attack roll as
          normal. Add 1 per 10 rounds at point-blank or close range or subtract
          1 at all other ranges.
          <br /> <strong>3.</strong>For every point above the DV, you hit with
          one bullet. Calculate hit damage for each bullet normally.
          <br />
          <strong>Suppressive fire</strong> allows you to create a fire zone.
          Calculate a save number by dividing your number of shots by the width
          of the fire zone in meters, round down. Enemies entering or crossing
          fire zone must make an Athletics + REF + 1d10 roll over the save
          number or be hit with 1d6 rounds. save against that number or be
          pinned down, unable to move or attack until the end of their next
          turn.{" "}
          <i>
            <strong>I</strong> like to make targets who wish to enter or cross
            the fire zone to make a COOL save first, unless RP reasons dictate
            otherwise - hardened solos aren't going to be fazed by bullets
            flying around, but a civilian might be compelled to dive for cover.
          </i>
        </p>
      </section>
      <section>
        <h4>Reliability</h4>
        <p>
          When you roll a <strong>fumble</strong> (natural 1 on the attack die),
          roll again. Semi-auto follow fumble table first, auto-weapons (
          <i>only on auto or burst at my table</i>) may jam right away -{" "}
          <i>Very Reliable</i> on 3 or lower, <i>Standard</i> {"<"}6,{" "}
          <i>Unreliable</i> {"<"}9. Jammed weapons take 1d6 turns to clear, and
          won't fire them again until cleared.
        </p>
      </section>
      <section>
        <h4>Concealability</h4>
        <p>
          How large and imposing the weapon is. <strong>P</strong> (Pocket) —
          easily hidden in a pocket, sleeve, pants leg. <strong>J</strong>{" "}
          (Jacket) — worn under a jacket, coat, shoulder rig. Not overt, but
          will be found. <strong>L</strong> (Longcoat) — hiding the weapon under
          the coat could buy you a second or two. <strong>N</strong> (No way
          you're hiding that) — visible no matter what, expect to draw
          attention.
        </p>
      </section>
      <section>
        <h4>Damage & Ammo Types</h4>
        <p>
          Guns don't hurt people, bullets do. The weapon's damage stat relies on
          the <strong>Caliber</strong>, which determines what kind of{" "}
          <strong>ammunition</strong> it can fire - damage and damage type
          depends on it, and not the weapon itself. See more in the{" "}
          <i>Ammo help bubble</i>
        </p>
      </section>
      <section>
        <h4>Smartguns</h4>
        <p>
          <strong>Smartchipped</strong> weapons connect to your neuralware
          interface plugs and pick up your mental signals, firing quicker and
          more precise than any finger ever could. This grants{" "}
          <strong>+2 WA</strong> — but only if you have the matching cyberware
          installed and you are connected to the weapon. <i>Targeting scope</i>{" "}
          eyeware option will project a targeting reticle into your field of
          vision, with an additional +1. <i>SmartPlate weapon link</i> implant
          will allow you to use the weapon's smartgun link by simply holding it
          in hand, no wires required.
        </p>
      </section>
    </>
  );
};
