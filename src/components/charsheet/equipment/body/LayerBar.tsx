import { getConditionClassFromSP } from "../utils";

interface Props {
  name: string;
  currentSP: number;
  maxSP: number;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}

export const LayerBar = ({ name, currentSP, maxSP, className = "", active, onClick }: Props) => {
  const conditionPercent = (currentSP / maxSP) * 100;
  const conditionClass = getConditionClassFromSP(currentSP, maxSP);

  const cls = [
    "layer",
    className,
    active && "layer-active",
    onClick && "layer-clickable",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      class={cls}
      title={`${name} — ${currentSP}/${maxSP} SP`}
      onClick={
        onClick
          ? (e: MouseEvent) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
    >
      <span class="layer-name">
        <span class="layer-label">{name}</span>
        <span class="layer-sp">{currentSP}</span>
      </span>
      <span
        class={`layer-condition ${conditionClass}`}
        style={{ width: `${conditionPercent}%` }}
      />
    </div>
  );
};
