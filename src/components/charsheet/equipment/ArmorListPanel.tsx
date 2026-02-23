import { useStore } from "@nanostores/preact";

import {
  $customArmorList,
  $ownedArmor,
  ARMOR_CATALOG,
  getAllOwnedArmor,
  getInstalledImplants,
  isImplant,
} from "@stores/armor";
import { startAddingArmor } from "@stores/ui";
import { $highlightedPart, tabStore } from "@stores/ui";

import { Panel } from "../shared/Panel";
import { TabStrip } from "../shared/TabStrip";

import { ArmorCard } from "./ArmorCard";
import { ImplantCard } from "./ImplantCard";

function sortArmor<T extends { type: string; spMax: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === "soft" ? -1 : 1;
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
  const tab = useStore(tabStore("armor-list-tab", "catalog"));
  const highlightedPart = useStore($highlightedPart);
  const customTemplates = useStore($customArmorList);

  const owned = getAllOwnedArmor().filter((a) => !isImplant(a));
  const sorted = sortArmor(owned);
  const implants = getInstalledImplants();

  const highlightedIds = highlightedPart
    ? new Set(
        owned
          .filter((a) => a.bodyParts.includes(highlightedPart))
          .map((a) => a.id),
      )
    : undefined;

  return (
    <Panel
      id="armor-list-panel"
      title={
        <>
          Armor{" "}
          <span class="armor-legend">
            <span class="armor-type-icon">{"\u2248"}</span>Soft{" "}
            <span class="armor-type-icon">{"\u2B21"}</span>Hard
          </span>
        </>
      }
      expanded={expanded}
      onToggle={onToggle}
      headerActions={
        <TabStrip
          persist="armor-list-tab"
          tabs={[
            { id: "catalog", label: "Catalog" },
            {
              id: "custom",
              label: `Custom${customTemplates.length > 0 ? ` ${customTemplates.length}` : ""}`,
            },
            {
              id: "owned",
              label: `Owned${owned.length > 0 ? ` ${owned.length}` : ""}`,
            },
          ]}
        />
      }
    >
      {tab === "owned" && (
        <div class="armor-card-list">
          {implants.length > 0 && (
            <>
              <div class="armor-group-label">Cybernetic</div>
              {implants.map((impl) => (
                <ImplantCard key={impl.id} implant={impl} />
              ))}
            </>
          )}
          {sorted.length === 0 && implants.length === 0 ? (
            <div class="empty-message">No armor owned</div>
          ) : (
            sorted.length > 0 && (
              <>
                {implants.length > 0 && (
                  <div class="armor-group-label">Worn</div>
                )}
                {sorted.map((armor) => (
                  <ArmorCard
                    key={armor.id}
                    armor={armor}
                    selected={selectedId === armor.id}
                    highlighted={highlightedIds?.has(armor.id)}
                    onClick={() =>
                      onSelect(selectedId === armor.id ? null : armor.id)
                    }
                  />
                ))}
              </>
            )
          )}
        </div>
      )}
      {tab === "custom" && (
        <div class="armor-card-list">
          <div class="gear-toolbar">
            <button class="gear-add-btn" onClick={() => startAddingArmor()}>
              + Add Custom
            </button>
          </div>
          {customTemplates.length === 0 ? (
            <div class="empty-message">No custom armor</div>
          ) : (
            sortArmor(customTemplates).map((tmpl) => (
              <ArmorCard
                key={tmpl.templateId}
                armor={tmpl}
                custom
                selected={selectedId === tmpl.templateId}
                highlighted={
                  highlightedPart
                    ? tmpl.bodyParts.includes(highlightedPart)
                    : false
                }
                onClick={() =>
                  onSelect(
                    selectedId === tmpl.templateId ? null : tmpl.templateId,
                  )
                }
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
              highlighted={
                highlightedPart
                  ? tmpl.bodyParts.includes(highlightedPart)
                  : false
              }
              onClick={() =>
                onSelect(
                  selectedId === tmpl.templateId ? null : tmpl.templateId,
                )
              }
            />
          ))}
        </div>
      )}
    </Panel>
  );
};
