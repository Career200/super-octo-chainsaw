import type { Ref } from "preact";
import { useEffect, useRef } from "preact/hooks";

/**
 * Scrolls an element into view when `active` transitions from false to true.
 * Returns a ref to attach to the target element.
 */
export function useScrollOnSelect<T extends HTMLElement>(
  active: boolean,
  block: ScrollLogicalPosition = "nearest",
): Ref<T> {
  const ref = useRef<T>(null);
  const wasActive = useRef(false);

  useEffect(() => {
    if (active && !wasActive.current) {
      ref.current?.scrollIntoView({ block });
    }
    wasActive.current = active;
  }, [active, block]);

  return ref;
}
