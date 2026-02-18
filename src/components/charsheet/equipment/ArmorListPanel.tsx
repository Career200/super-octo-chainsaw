import { useStore } from "@nanostores/preact";
import {
  $ownedArmor,
  getAllOwnedArmor,
  isImplant,
  acquireArmor,
  ARMOR_CATALOG,
} from "@stores/armor";
import { Panel } from "../shared/Panel";
import { TabStrip } from "../shared/TabStrip";
import { ArmorCard } from "./ArmorCard";
import { BodyPartsCoverage } from "./BodyPartsCoverage";
import { tabStore } from "@stores/ui";

function sortArmor<T extends { type: string; spMax: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    // soft before hard
    if (a.type !== b.type) return a.type === "soft" ? -1 : 1;
    // ascending SP within type
    return a.spMax - b.spMax;
  });
}

const catalogTemplates = sortArmor(Object.values(ARMOR_CATALOG));

export const ArmorListPanel = ({
  expanded,
  onToggle,
  selectedId,
  highlightedIds,
  onSelect,
}: {
  expanded: boolean;
  onToggle: () => void;
  selectedId: string | null;
  highlightedIds?: Set<string>;
  onSelect: (id: string | null) => void;
}) => {
  useStore($ownedArmor);
  const tab = useStore(tabStore("armor-list-tab", "owned"));

  const owned = getAllOwnedArmor().filter((a) => !isImplant(a));
  const sorted = sortArmor(owned);

  return (
    <Panel
      id="armor-list-panel"
      title="Armor"
      expanded={expanded}
      onToggle={onToggle}
      headerActions={
        <TabStrip
          persist="armor-list-tab"
          tabs={[
            { id: "owned", label: `Owned${owned.length > 0 ? ` ${owned.length}` : ""}` },
            { id: "catalog", label: "Catalog" },
          ]}
        />
      }
    >
      {tab === "owned" && (
        <div class="armor-card-list">
          {sorted.length === 0 ? (
            <div class="empty-message">No armor owned</div>
          ) : (
            sorted.map((armor) => (
              <ArmorCard
                key={armor.id}
                armor={armor}
                selected={selectedId === armor.id}
                highlighted={highlightedIds?.has(armor.id)}
                onClick={() => onSelect(selectedId === armor.id ? null : armor.id)}
              />
            ))
          )}
        </div>
      )}
      {tab === "catalog" && (
        <div class="armor-card-list">
          {catalogTemplates.map((tmpl) => (
            <div key={tmpl.templateId} class="armor-card">
              <div class="flex-between gap-8">
                <h4>
                  <span class="armor-type-icon">
                    {tmpl.type === "hard" ? "\u2B21" : "\u2248"}
                  </span>
                  {tmpl.name}
                </h4>
                <span class="armor-card-sp">{tmpl.spMax}</span>
              </div>
              <div class="armor-card-details">
                <BodyPartsCoverage bodyParts={tmpl.bodyParts} />
                {tmpl.ev != null && tmpl.ev > 0 && (
                  <span class="armor-card-ev">EV {tmpl.ev}</span>
                )}
                {tmpl.availability && (
                  <span class="armor-card-avail">{tmpl.availability}</span>
                )}
              </div>
              <p class="text-desc armor-card-description">{tmpl.description}</p>
              <div class="armor-card-actions">
                <button
                  class="btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    acquireArmor(tmpl.templateId);
                  }}
                >
                  Acquire ({tmpl.cost}eb)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};
