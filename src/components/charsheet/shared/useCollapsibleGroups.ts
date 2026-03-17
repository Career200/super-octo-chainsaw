import { useCallback, useState } from "preact/hooks";

export function useCollapsibleGroups(
  initial: Set<string> | (() => Set<string>) = new Set(),
) {
  const [collapsed, setCollapsed] = useState(initial);
  const toggle = useCallback(
    (key: string) =>
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      }),
    [],
  );
  return { collapsed, toggle };
}
