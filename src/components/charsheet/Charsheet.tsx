import { useEffect, useState } from "preact/hooks";
import { Biomonitor } from "../biomon";
import { ArmorView } from "./ArmorView";

type Tab = "biomon" | "armor";

function getTab() {
  /* page should be /charsheet/#biomon or /charsheet/#armor */
  const hash = window.location.hash.slice(1);
  if (hash === "biomon" || hash === "armor") {
    return hash;
  }
  return "";
}

export const Charsheet = () => {
  const [tab, setTab] = useState(getTab());

  useEffect(() => {
    const onHash = () => setTab(getTab());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div class={`charsheet-spa ${tab}-section`}>
      {tab === "biomon" ? <Biomonitor /> : <ArmorView />}
    </div>
  );
};
