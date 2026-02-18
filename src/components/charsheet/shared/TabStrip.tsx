import { useStore } from "@nanostores/preact";
import type { ComponentChildren } from "preact";
import { tabStore } from "@stores/ui";
import { useEffect } from "preact/hooks";

interface TabDef {
  id: string;
  label: ComponentChildren;
}

interface TabStripProps {
  tabs: TabDef[];
  persist: string;
  class?: string;
}

export const TabStrip = ({
  tabs,
  persist,
  class: className,
}: TabStripProps) => {
  const $store = tabStore(persist, tabs[0].id);
  const active = useStore($store);

  useEffect(() => {
    // Auto-correct invalid stored value
    const validIds = tabs.map((t) => t.id);
    if (!validIds.includes(active)) {
      $store.set(tabs[0].id);
    }
  }, []);

  return (
    <span
      class={`tab-strip${className ? ` ${className}` : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          class={active === tab.id ? "active" : ""}
          onClick={() => $store.set(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </span>
  );
};
