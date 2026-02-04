import { $health, setDamage } from "@stores/health";
import type { DamageType } from "@scripts/biomon/types";

interface Props {
  index: number;
  type: DamageType;
  filled: boolean;
  showStun: boolean;
}

export const WoundBox = ({ index, type, filled, showStun }: Props) => {
  const handleClick = () => {
    if (type === "stun" && !showStun) return;

    const state = $health.get();
    const currentValue = type === "physical" ? state.physical : state.stun;
    const syncStun = type === "physical" && !showStun;

    if (currentValue >= index) {
      setDamage(index - 1, type, syncStun);
    } else {
      setDamage(index, type, syncStun);
    }
  };

  return (
    <div
      class={`wound-box ${filled ? "filled" : ""}`}
      onClick={handleClick}
      data-index={index}
      data-type={type}
    />
  );
};
