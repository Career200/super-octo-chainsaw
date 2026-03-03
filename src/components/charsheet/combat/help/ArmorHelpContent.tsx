import { useStore } from "@nanostores/preact";

import { $homerules } from "@stores/homerules";

export const ArmorHelpContent = () => {
  const { scaledDegradation } = useStore($homerules);

  return (
    <>
      <h3>Body Armor</h3>
      <section>
        <h4>Stopping Power (SP)</h4>
        <p>
          Each body part shows its total <strong>SP</strong>. When hit, SP
          absorbs damage — any excess penetrates and becomes a wound. Armor
          loses 1 SP per penetrating hit.
          {scaledDegradation &&
            " The top layer takes extra degradation: +1 per 3 over (soft) or +1 per 4 over (hard)."}
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
          Armor can stack up to 3 layers per body part. The strongest layer
          provides base SP; each additional layer adds a bonus (0-5) based on
          the SP gap — layers that are closer in SP give a bigger bonus. See
          Equipment tab for details.
        </p>
      </section>
    </>
  );
};
