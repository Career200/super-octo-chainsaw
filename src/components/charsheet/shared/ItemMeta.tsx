import { AVAILABILITY_LABELS } from "@scripts/catalog-common";

interface Props {
  availability?: string;
  cost?: number;
}

export const ItemMeta = ({ availability: av = "C", cost }: Props) => {
  return (
    <span class="item-meta">
      <span class={`item-avail avail-${av}`}>
        Av.{AVAILABILITY_LABELS[av]}
      </span>
      {cost != null && (
        <span class="text-soft">
          <span class="cash">{"\u156E\u1572"}</span>
          {cost}eb
        </span>
      )}
    </span>
  );
};
