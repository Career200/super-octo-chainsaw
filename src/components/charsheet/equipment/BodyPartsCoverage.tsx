import { BODY_PARTS, PART_ABBREV, type BodyPartName } from "@scripts/armor/core";
import { getConditionClassFromSP } from "./utils";

interface Props {
  bodyParts: BodyPartName[];
  spByPart?: Partial<Record<BodyPartName, number>>;
  spMax?: number;
}

export const BodyPartsCoverage = ({ bodyParts, spByPart, spMax }: Props) => {
  const isFullBody = bodyParts.length >= BODY_PARTS.length;

  if (isFullBody && !spByPart) {
    return (
      <div class="flex-end gap-4 body-parts-coverage">
        <span class="coverage-badge coverage-full">Full</span>
      </div>
    );
  }

  return (
    <div class="flex-end gap-4 body-parts-coverage">
      {bodyParts.map((part) => {
        let cls = "coverage-badge";
        if (spByPart && spMax) {
          const condCls = getConditionClassFromSP(spByPart[part] ?? spMax, spMax);
          if (condCls === "condition-damaged" || condCls === "condition-critical") {
            cls += ` ${condCls}`;
          }
        }
        return (
          <span key={part} class={cls} title={part.replace("_", " ")}>
            {PART_ABBREV[part]}
          </span>
        );
      })}
    </div>
  );
};
