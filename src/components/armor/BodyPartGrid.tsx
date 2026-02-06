import { BodyPartCard } from "./BodyPartCard";
import { FaceCard } from "./FaceCard";
import { SkinweaveDisplay } from "./SkinweaveDisplay";
import { ImplantsDisplay } from "./ImplantsDisplay";
import { EVDisplay } from "./EVDisplay";

export const BodyPartGrid = () => {
  return (
    <div class="body-grid">
      <SkinweaveDisplay />
      <BodyPartCard part="head" />
      <FaceCard />
      <ImplantsDisplay />
      <BodyPartCard part="torso" />
      <BodyPartCard part="left_arm" />
      <BodyPartCard part="right_arm" />
      <BodyPartCard part="left_leg" />
      <EVDisplay />
      <BodyPartCard part="right_leg" />
    </div>
  );
};
