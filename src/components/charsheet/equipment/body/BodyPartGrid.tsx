import { BodyPartCard } from "./BodyPartCard";
import { EVDisplay } from "./EVDisplay";
import { FaceCard } from "./FaceCard";
import { ImplantsDisplay } from "./ImplantsDisplay";
import { SkinweaveDisplay } from "./SkinweaveDisplay";

interface Props {
  mode?: "biomon" | "inventory";
}

export const BodyPartGrid = ({ mode = "biomon" }: Props) => {
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
