import { useEffect, useState } from "preact/hooks";
import { Biomonitor } from "../biomon";
import { ArmorView } from "./ArmorView";

type Tab = "biomon" | "armor";

function getTab(): Tab {
  return location.hash === "#armor" ? "armor" : "biomon";
}

export const Charsheet = () => {
  const [tab, setTab] = useState<Tab>(getTab);

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
