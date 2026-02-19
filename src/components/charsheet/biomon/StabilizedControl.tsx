import { useStore } from "@nanostores/preact";
import { $health, setStabilized, isMortal } from "@stores/health";

export const StabilizedControl = () => {
  const health = useStore($health);
  const { stabilized, physical } = health;
  const mortal = isMortal(physical);
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
      {physical > 0 && <span class="wound-count">{physical}</span>}
    </div>
  );
};
