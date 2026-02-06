import { useStore } from "@nanostores/preact";
import { $ownedArmor, getAllOwnedArmor, isImplant } from "@stores/armor";
import { Panel } from "@components/shared/Panel";
import { ArmorItem } from "./ArmorItem";

export const InventoryPanel = () => {
  useStore($ownedArmor);

  const owned = getAllOwnedArmor();
  const implants = owned.filter((a) => isImplant(a) && a.worn);
  const regularArmor = owned.filter((a) => !isImplant(a));

  return (
    <Panel
      id="armor-inventory-panel"
      title="Owned Armor"
      headerActions={
        <span class="flex-center gap-2 text-soft armor-legend">
          <span class="armor-type-icon">⬡</span>Hard{" "}
          <span class="armor-type-icon">≈</span>Soft
        </span>
      }
    >
      {owned.length === 0 ? (
        <p class="empty-message">No armor owned. Visit the store to acquire some.</p>
      ) : (
        <>
          {implants.length > 0 && (
            <div class="implant-group">
              <div class="text-label implant-group-label">Installed Implants</div>
              {implants.map((implant) => (
                <ArmorItem key={implant.id} armor={implant} showActions={false} />
              ))}
            </div>
          )}
          {regularArmor.map((armor) => (
            <ArmorItem key={armor.id} armor={armor} showActions={true} />
          ))}
        </>
      )}
    </Panel>
  );
};
