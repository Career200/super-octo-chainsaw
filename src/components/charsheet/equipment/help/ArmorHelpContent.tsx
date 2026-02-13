export const ArmorHelpContent = () => {
  return (
    <>
      <h3>Armor Mechanics</h3>
      <section>
        <h4>Stopping Power (SP)</h4>
        <p>
          <strong>SP</strong> is your armor's ability to stop damage. When hit,
          your armor's SP is subtracted from the damage — the remainder hits you.
          If damage is less than your SP, you walk away clean.
        </p>
      </section>
      <blockquote>
        "Rated SP20. You can walk through fire. Just like the holos, choomba..."
        <cite>— Unidentified Fixer, 2015</cite>
      </blockquote>
      <section>
        <h4>Hard vs Soft Armor</h4>
        <p>
          Armor is classified as <strong>hard</strong>{" "}
          (metal/ceramic/composite) or <strong>soft</strong> (ballistic fabric)
          — affecting layering rules, degradation rates, and how certain weapons
          interact with it.
        </p>
      </section>
      <section>
        <h4>Layered Protection</h4>
        <p>
          Multiple armor layers combine using <strong>proportional SP</strong> —
          the strongest layer provides full protection, weaker layers add a bonus
          (0-5) based on the SP difference — the smaller the difference, the
          larger the bonus. However you can only benefit from up to{" "}
          <strong>3 layers</strong> per body part, and only{" "}
          <strong>1 hard armor</strong> layer is allowed. Not to mention the
          extra bulk and heat, that is reflected in Encumbrance Value (EV) -
          which will be deducted from your REF stat.
        </p>
      </section>
      <section>
        <h4>Taking Hits</h4>
        <p>
          When damage exceeds your effective SP, it{" "}
          <strong>penetrates</strong>. All layers take 1 SP damage. The{" "}
          <strong>top layer</strong> (highest SP) takes additional degradation
          based on how much the hit exceeded your protection.{" "}
          <strong>Soft</strong> armor: +1 per 5 over. <strong>Hard</strong>{" "}
          armor: +1 per 6 over.
        </p>
      </section>
      <section>
        <h4>Layer Rotation</h4>
        <p>
          As your top layer shreds, another becomes your primary protection.
          Your backup armor <strong>takes point</strong>, spreading wear across
          your gear.
        </p>
      </section>
      <section>
        <h4>Implanted armor</h4>
        <p>
          Implanted armor provides a baseline protection that's always active.
          It follows the same proportional SP armor rules, but cannot be removed.
          There are three types of implanted armor:{" "}
          <strong>SkinWeave</strong> - a biotech mod, the result of hard work of
          thousands of nanomachines weaving protective fibers into your skin.{" "}
          <strong>Subdermal Armor</strong> - a mesh/ballistic plastic plates,
          surgically implanted into the torso.{" "}
          <strong>Body plating</strong> - ablative plastic shell with metal
          energy absorbing honeycomb directly anchored to the skin.
        </p>
        <p>
          SkinWeave ranges from SP8 (impossible to notice) to SP14 (rubbery to
          the touch). Subdermal armor offers SP20 and is difficult to notice.
          Body plating provides SP25, but is bulky and highly visible.
        </p>
      </section>
    </>
  );
};
