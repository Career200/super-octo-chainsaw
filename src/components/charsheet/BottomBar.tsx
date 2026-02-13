import { useState, useRef } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $spaTab } from "@stores/ui";
import { BottomBarSkills } from "./BottomBarSkills";
import { BottomBarHistory } from "../biomon/BottomBarHistory";

export const BottomBar = () => {
  const tab = useStore($spaTab);
  const [expanded, setExpanded] = useState(false);

  // Collapse when switching tabs
  const tabRef = useRef(tab);
  if (tabRef.current !== tab) {
    tabRef.current = tab;
    if (expanded) setExpanded(false);
  }

  return (
    <div class={`bottom-bar${expanded ? " expanded" : ""}`}>
      {tab === "rp" && <BottomBarSkills />}
      {tab === "biomon" && (
        <BottomBarHistory
          expanded={expanded}
          onToggle={() => setExpanded((e) => !e)}
        />
      )}
    </div>
  );
};
