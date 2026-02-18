import { acquireArmor, ARMOR_CATALOG } from "@stores/armor";
import { Panel } from "../shared/Panel";
import { BodyPartsCoverage } from "./BodyPartsCoverage";

const sortedTemplates = Object.values(ARMOR_CATALOG)
  .sort((a, b) => {
    if (a.spMax !== b.spMax) return a.spMax - b.spMax;
    if (a.type !== b.type) return a.type === "soft" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

export const ShopPanel = ({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) => {
  return (
    <Panel
      id="armor-store-panel"
      title="Armor Store"
      expanded={expanded}
      onToggle={onToggle}
    >
      {sortedTemplates.map((template) => (
        <div key={template.templateId} class="store-item">
          <div class="flex-between gap-12 armor-header">
            <h4>
              <span class="armor-type-icon">
                {template.type === "hard" ? "⬡" : "≈"}
              </span>
              {template.name}
            </h4>
            <span class="armor-sp">
              {template.ev
                ? `${template.spMax} | EV: ${template.ev}`
                : `${template.spMax}`}
            </span>
          </div>
          <BodyPartsCoverage bodyParts={template.bodyParts} />
          {template.description && (
            <p class="text-desc store-description">{template.description}</p>
          )}
          <div class="flex-between gap-8 store-actions">
            <button
              class="btn-secondary"
              onClick={() => acquireArmor(template.templateId)}
            >
              {template.cost ? `Buy (${template.cost}eb)` : "Buy"}
            </button>
            <button
              class="btn-ghost"
              onClick={() => acquireArmor(template.templateId)}
            >
              Take (Free)
            </button>
          </div>
        </div>
      ))}
    </Panel>
  );
};
