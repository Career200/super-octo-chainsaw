export const WoundHelpContent = () => {
  return (
    <>
      <h3>Wound Tracker</h3>
      <section>
        <h4>Wound Levels</h4>
        <p>
          Levels represent severity of injuries. Higher levels apply increasing
          penalties — always to STUN/SHOCK saves, and to other stats and actions
          depending on the character's state.
        </p>
      </section>
      <details>
        <summary>Level Breakdown</summary>
        <p>
          <strong>Light</strong> — minor injuries, bruises, small cuts. No
          penalties, minor discomfort.
        </p>
        <p>
          <strong>Serious</strong> — moderate injuries, broken bones, deep cuts.
          -2 REF for all actions. Hurting, bleeding, requires medical attention.
        </p>
        <p>
          <strong>Critical</strong> — severe injuries, major impairment. REF,
          INT and CL are halved (round up). Immobile for at least half the day,
          REF at -2 during recovery.
        </p>
        <p>
          <strong>Mortal</strong> — high chance of death without immediate
          medical attention. Make <strong>DEATH SAVES</strong> each turn until
          stabilized. REF, INT and CL reduced to 1/3 (round up). Bedridden,
          likely comatose, or on life support. Requires constant care, REF at -4
          during recovery.
        </p>
      </details>
      <details>
        <summary>Physical vs Stun</summary>
        <p>
          <strong>Physical</strong> — real wounds (bullets, blades, fire).{" "}
          <strong>Stun</strong> — shock, pain, exhaustion (tasers, stun
          grenades, concussion).
        </p>
        <p>
          Taking physical damage <strong>always applies stun</strong>. Stun
          damage determines wound penalties for saves.
        </p>
      </details>
      <details>
        <summary>Stable vs Unstable</summary>
        <p>
          <strong>Unstable</strong> — active combat or uncontrolled injury.
          Harsh penalties: REF at -2 (Serious), REF/INT/CL halved (Critical), or
          reduced to 1/3 (Mortal). Must make <strong>DEATH SAVES</strong> each
          turn at Mortal wounds.
        </p>
        <p>
          <strong>Stable</strong> — bleeding stopped, wounds dressed, or
          recovering. Only REF penalties apply (-2 Serious, -4 Critical, scaling
          at Mortal). No death saves required.
        </p>
        <p>
          Crossing into <strong>Mortal</strong> automatically destabilizes.
          Stabilization requires medical attention or successful stabilization
          roll.
        </p>
      </details>
    </>
  );
};
