import { useStore } from "@nanostores/preact";
import {
  $ownedArmor,
  getSkinweaveLevel,
  installSkinweave,
  uninstallSkinweave,
} from "@stores/armor";

type SkinweaveLevel = 0 | 8 | 10 | 12 | 14;

const SKINWEAVE_TEMPLATE_MAP: Record<SkinweaveLevel, string | null> = {
  0: null,
  8: "skinweave_8",
  10: "skinweave_10",
  12: "skinweave_12",
  14: "skinweave_14",
};

export const SkinweaveDisplay = () => {
  useStore($ownedArmor);

  const level = getSkinweaveLevel();
  const isInstalled = level > 0;

  const handleChange = (e: Event) => {
    const value = parseInt((e.target as HTMLSelectElement).value, 10) as SkinweaveLevel;
    const templateId = SKINWEAVE_TEMPLATE_MAP[value];

    if (templateId) {
      installSkinweave(templateId);
    } else {
      uninstallSkinweave();
    }
  };

  return (
    <div
      class={`display-box skinweave-display${isInstalled ? " installed" : ""}`}
      id="skinweave-display"
    >
      <span class="text-label-lg skinweave-label">SkinWeave</span>
      <span class="text-desc-justified skinweave-desc">
        covers all body parts, always calculated as bottom layer,{" "}
        <i>does not count toward 3-layer limit</i>
      </span>
      <select
        class="skinweave-select"
        id="skinweave-select"
        value={level.toString()}
        onChange={handleChange}
      >
        <option value="0">None</option>
        <option value="8">SP 8</option>
        <option value="10">SP 10</option>
        <option value="12">SP 12</option>
        <option value="14">SP 14</option>
      </select>
    </div>
  );
};
