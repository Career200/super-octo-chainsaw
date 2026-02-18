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
import { tabStore, $highlightedPart, selectArmor } from "@stores/ui";

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
  onSelect,
}: {
  expanded: boolean;
  onToggle: () => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) => {
  useStore($ownedArmor);
  const tab = useStore(tabStore("armor-list-tab", "owned"));
  const highlightedPart = useStore($highlightedPart);

  const owned = getAllOwnedArmor().filter((a) => !isImplant(a));
  const sorted = sortArmor(owned);

  // Compute which armor IDs cover the highlighted body part (all owned, not just worn)
  const highlightedIds = highlightedPart
    ? new Set(owned.filter((a) => a.bodyParts.includes(highlightedPart)).map((a) => a.id))
    : undefined;

  const handleAcquire = (e: MouseEvent, templateId: string) => {
    e.stopPropagation();
    const instance = acquireArmor(templateId);
    if (instance) selectArmor(instance.id);
  };

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
            <ArmorCard
              key={tmpl.templateId}
              armor={tmpl}
              selected={selectedId === tmpl.templateId}
              highlighted={highlightedPart ? tmpl.bodyParts.includes(highlightedPart) : false}
              onClick={() => onSelect(selectedId === tmpl.templateId ? null : tmpl.templateId)}
              onAcquire={(e: MouseEvent) => handleAcquire(e, tmpl.templateId)}
            />
          ))}
        </div>
      )}
    </Panel>
  );
};
