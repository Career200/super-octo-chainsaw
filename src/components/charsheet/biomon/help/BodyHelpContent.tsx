export const BodyHelpContent = () => {
  return (
    <>
      <h3>Body Type</h3>
      <section>
        <h4>BT (Body Type)</h4>
        <p>
          Determines strength, endurance, damage capacity, carry/lift limits,
          shock recovery, and melee damage bonus.
        </p>
      </section>
      <section>
        <h4>Carry / Lift</h4>
        <p>
          Carry up to <strong>10×BT</strong> kg. Dead lift up to{" "}
          <strong>40×BT</strong> kg.
        </p>
      </section>
      <section>
        <h4>BTM (Body Type Modifier)</h4>
        <p>
          Subtracted from incoming damage after armor. Reflects toughness.
          Cannot reduce damage below 1.
        </p>
        <p>
          <strong>Very Weak (BT 1-2)</strong> 0 • <strong>Weak (BT 3-4)</strong>{" "}
          -1 • <strong>Average (BT 5-6)</strong> -2 •{" "}
          <strong>Strong (BT 7-8)</strong> -3 •{" "}
          <strong>Very Strong (BT 9-10)</strong> -4 •{" "}
          <strong>Superhuman (BT 11+)</strong> -5
        </p>
      </section>
      <section>
        <h4>Save (Stun/Shock)</h4>
        <p>
          Whenever you receive damage or stun damage, you experience pain and
          shock. Roll <strong>1d10 ≤ BT - wound penalty</strong> to stay
          conscious and focused. Failed = out of combat until recovered.
        </p>
        <p>
          Wound penalties: Light 0, Serious -1, Critical -2, Mortal 0-6 → -3 to
          -9.
        </p>
      </section>
      <section>
        <h4>Death Saves</h4>
        <p>
          At <strong>Mortal</strong> wounds, roll{" "}
          <strong>1d10 ≤ BT - mortal level</strong> each turn or die. Only
          stabilization stops the clock.
        </p>
        <p>
          Mortal 0: BT-0, Mortal 1: BT-1, Mortal 2: BT-2, … Mortal 6: BT-6.
        </p>
      </section>
    </>
  );
};
