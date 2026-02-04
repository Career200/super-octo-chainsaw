import { useStore } from '@nanostores/preact';
import { $health, setStabilized } from '@stores/health';

export const StabilizedControl = () => {
  const health = useStore($health);
  const { stabilized } = health;

  const handleClick = () => {
    setStabilized(!stabilized);
  };

  return (
    <div
      class={`stabilized-control ${stabilized ? 'stabilized' : 'unstable'}`}
      onClick={handleClick}
    >
      <div class={`wound-box ${stabilized ? 'filled' : ''}`} />
      <span class="stabilized-label">{stabilized ? 'Stable' : 'Unstable'}</span>
    </div>
  );
};
