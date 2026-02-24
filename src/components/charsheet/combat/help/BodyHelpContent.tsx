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
        <h4>BTM, Saves</h4>
        <p>
          BTM, Stun/Shock Save and Death Save are damage resolution stats — see
          the <strong>Defense panel</strong> help for details.
        </p>
      </section>
    </>
  );
};
