import { useRef } from "preact/hooks";

/**
 * Tracks adding/selected state changes and auto-expands/collapses the bottom bar.
 * Call once per domain (skills, gear, etc.) inside BottomBar.
 */
export function useAutoExpand(
  adding: boolean,
  selected: string | null,
  expanded: boolean,
  setExpanded: (v: boolean) => void,
): void {
  const addingRef = useRef(adding);
  if (adding && !addingRef.current) {
    if (!expanded) setExpanded(true);
  }
  addingRef.current = adding;

  const selectedRef = useRef(selected);
  if (selected && selected !== selectedRef.current) {
    if (!expanded) setExpanded(true);
  }
  if (!selected && selectedRef.current && !adding) {
    if (expanded) setExpanded(false);
  }
  selectedRef.current = selected;
}
