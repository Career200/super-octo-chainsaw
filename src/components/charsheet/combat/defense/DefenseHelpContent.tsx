export const DefenseHelpContent = () => {
  return (
    <>
      <h3>Defense Panel</h3>
      <p>
        Someone's trying to hurt you. This panel has everything you need to
        resolve incoming damage.
      </p>
      <section>
        <h4>Wounds (left)</h4>
        <p>
          Track damage taken. Click boxes to mark wound levels (Light → Mortal).
          Higher levels apply stat penalties and require save rolls. Toggle{" "}
          <strong>Stun</strong> to track stun damage separately.
        </p>
      </section>
      <section>
        <h4>Body Armor (right)</h4>
        <p>
          <strong>SP</strong> (Stopping Power) per body part. When hit, the
          location's SP absorbs damage before it reaches you. Armor degrades
          with each penetrating hit.
        </p>
        <p>
          Use the <strong>hit buttons</strong> on each body part for the d10 hit
          location roll reference.
        </p>
      </section>
      <section>
        <h4>BTM (Body Type Modifier)</h4>
        <p>
          Subtracted from incoming damage after armor. Reflects toughness.
          Cannot reduce damage below 1.
        </p>
      </section>
      <section>
        <h4>Stun/Shock Save</h4>
        <p>
          On taking damage, roll <strong>1d10 ≤ BT - wound penalty</strong> to
          stay conscious. Penalties: Light 0, Serious -1, Critical -2, Mortal
          -3 to -9.
        </p>
      </section>
      <section>
        <h4>Death Saves</h4>
        <p>
          At <strong>Mortal</strong> wounds, roll{" "}
          <strong>1d10 ≤ BT - mortal level</strong> each turn or go into DEATH state. Only
          stabilization stops the clock.
        </p>
      </section>
    </>
  );
};
