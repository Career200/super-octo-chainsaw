import {
  type ArmorTemplate,
  BODY_PARTS,
  type BodyPartName,
  getPartSpMax,
  PART_ABBREV,
} from "@scripts/armor/core";

import { getConditionClassFromSP } from "./utils";

interface Props {
  bodyParts: BodyPartName[];
  spByPart?: Partial<Record<BodyPartName, number>>;
  template?: ArmorTemplate;
}

export const BodyPartsCoverage = ({ bodyParts, spByPart, template }: Props) => {
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
        if (spByPart && template) {
          const partMax = getPartSpMax(template, part);
          const condCls = getConditionClassFromSP(
            spByPart[part] ?? partMax,
            partMax,
          );
          if (
            condCls === "condition-damaged" ||
            condCls === "condition-critical"
          ) {
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
