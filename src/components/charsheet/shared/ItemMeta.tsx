import { AVAILABILITY_LABELS } from "@scripts/catalog-common";

interface Props {
  availability?: string;
  cost?: number;
}

export const ItemMeta = ({ availability, cost }: Props) => {
  if (!availability && cost == null) return null;
  return (
    <span class="item-meta">
      {availability && (
        <span class="item-avail">Av.{AVAILABILITY_LABELS[availability]}</span>
      )}
      {cost != null && (
        <span class="text-soft">
          <span class="cash">{"\u156E\u1572"}</span>
          {cost}eb
        </span>
      )}
    </span>
  );
};
