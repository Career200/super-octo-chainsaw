import { BodyPartCard } from "./BodyPartCard";
import { EVDisplay } from "./EVDisplay";
import { FaceCard } from "./FaceCard";
import { ImplantsDisplay } from "./ImplantsDisplay";
import { SkinweaveDisplay } from "./SkinweaveDisplay";

interface Props {
  mode?: "combat" | "inventory";
}

export const BodyPartGrid = ({ mode = "combat" }: Props) => {
  if (mode === "combat") {
    return (
      <div class="body-grid-combat">
        <FaceCard mode="combat" />
        <BodyPartCard part="head" mode="combat" />
        <BodyPartCard part="torso" mode="combat" />
        <BodyPartCard part="right_arm" mode="combat" />
        <BodyPartCard part="left_arm" mode="combat" />
        <BodyPartCard part="right_leg" mode="combat" />
        <BodyPartCard part="left_leg" mode="combat" />
      </div>
    );
  }

  return (
    <div class="body-grid">
      <SkinweaveDisplay />
      <BodyPartCard part="head" mode={mode} />
      <FaceCard mode={mode} />
      <ImplantsDisplay />
      <BodyPartCard part="torso" mode={mode} />
      <BodyPartCard part="left_arm" mode={mode} />
      <BodyPartCard part="right_arm" mode={mode} />
      <BodyPartCard part="left_leg" mode={mode} />
      <EVDisplay />
      <BodyPartCard part="right_leg" mode={mode} />
    </div>
  );
};
