export const ArmorHelpContent = () => {
  return (
    <>
      <h3>Body Armor</h3>
      <section>
        <h4>Stopping Power (SP)</h4>
        <p>
          Each body part shows its total <strong>SP</strong>. When hit, SP
          absorbs damage — any excess penetrates and becomes a wound. Armor
          loses 1 SP per penetrating hit.
        </p>
      </section>
      <section>
        <h4>Hit Location</h4>
        <p>
          Roll <strong>1d10</strong> to determine where a hit lands. Each body
          part shows its hit roll range. Head hits get a second roll: 1-4 face,
          5-10 head.
        </p>
      </section>
      <section>
        <h4>Layers</h4>
        <p>
          Armor can stack in layers. Only the highest SP layer stops damage, but
          the second-highest adds +5 to the total. Manage layers in the
          Equipment tab.
        </p>
      </section>
    </>
  );
};
