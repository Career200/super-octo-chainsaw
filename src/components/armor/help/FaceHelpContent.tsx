import type { ArmorPiece } from "@scripts/armor/core";

interface Props {
  layers: { name: string; sp: number }[];
}

export const FaceHelpContent = ({ layers }: Props) => {
  const sorted = [...layers].sort((a, b) => b.sp - a.sp);

  return (
    <>
      <h3>Face Protection</h3>
      <section>
        <h4>Targeting</h4>
        <p>
          On head hits, roll <strong>1d10</strong>: results{" "}
          <strong>1-4</strong> hit the face, <strong>5-10</strong> hit the head.
          Face damage degrades head armor.
        </p>
      </section>
      <section>
        <h4>Coverage</h4>
        <ul>
          <li>
            <strong>Heavy helmets</strong> protect face at half SP
          </li>
          <li>
            <strong>Faceplate</strong> provides full protection
          </li>
          <li>
            <strong>SkinWeave</strong> provides full protection
          </li>
        </ul>
      </section>
      {sorted.length > 0 ? (
        <section>
          <h4>Active Protection</h4>
          <ul class="face-layer-list">
            {sorted.map((l) => (
              <li key={l.name}>
                {l.name}: SP {l.sp}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section>
          <p class="face-no-protection">No face protection equipped.</p>
        </section>
      )}
    </>
  );
};
