import { useStore } from "@nanostores/preact";
import type { WritableAtom } from "nanostores";

interface TabDef {
  id: string;
  label: string;
}

interface TabStripProps {
  tabs: TabDef[];
  $store: WritableAtom<string>;
  class?: string;
}

export const TabStrip = ({ tabs, $store, class: className }: TabStripProps) => {
  const active = useStore($store);

  return (
    <div class={`tab-strip${className ? ` ${className}` : ""}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          class={active === tab.id ? "active" : ""}
          onClick={() => $store.set(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
