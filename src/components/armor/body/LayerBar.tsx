import { getConditionClassFromSP } from "../utils";

interface Props {
  name: string;
  currentSP: number;
  maxSP: number;
  className?: string;
}

export const LayerBar = ({ name, currentSP, maxSP, className = "" }: Props) => {
  const conditionPercent = (currentSP / maxSP) * 100;
  const conditionClass = getConditionClassFromSP(currentSP, maxSP);

  return (
    <div
      class={`layer ${className}`.trim()}
      title={`${name} — ${currentSP}/${maxSP} SP`}
    >
      <span class="layer-name">{name}</span>
      <span
        class={`layer-condition ${conditionClass}`}
        style={{ width: `${conditionPercent}%` }}
      />
    </div>
  );
};
