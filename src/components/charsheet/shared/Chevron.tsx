interface Props {
  expanded: boolean;
  class?: string;
}

export const Chevron = ({ expanded, class: cls }: Props) => (
  <span class={`collapse-chevron${cls ? ` ${cls}` : ""}`}>
    {expanded ? "\u25B4" : "\u25BE"}
  </span>
);
