import { useStore } from "@nanostores/preact";

import { $health, isMortal, setStabilized } from "@stores/health";

export const StabilizedControl = () => {
  const health = useStore($health);
  const { stabilized, stun } = health;
  const mortal = isMortal(stun);
  const isStable = !mortal || stabilized;

  const handleClick = () => {
    if (mortal) setStabilized(!stabilized);
  };

  return (
    <div
      class={`stabilized-control ${isStable ? "stabilized" : "unstable"}${!mortal ? " disabled" : ""}`}
      onClick={handleClick}
    >
      <div class={`wound-box ${isStable ? "filled" : ""}`} role={"checkbox"} />
      <span class="stabilized-label">{isStable ? "Stable" : "Unstable"}</span>
    </div>
  );
};
