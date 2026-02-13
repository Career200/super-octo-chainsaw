import { useState, useRef } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  $ownedArmor,
  getImplantTemplates,
  getInstalledImplants,
  installImplant,
  uninstallImplant,
  isImplantInstalled,
  isSkinweave,
} from "@stores/armor";
import { Popover } from "../../shared/Popover";
import { getConditionClassFromSP } from "../utils";

export const ImplantsDisplay = () => {
  useStore($ownedArmor);

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  const installed = getInstalledImplants().filter((i) => !isSkinweave(i));
  const hasImplants = installed.length > 0;

  const templates = getImplantTemplates();
  const templateIds = Object.keys(templates).filter((id) => !isSkinweave(id));

  const handleInstall = (templateId: string) => {
    const result = installImplant(templateId);
    if (!result.success) {
      setError(result.error);
      setTimeout(() => setError(null), 2000);
    }
  };

  return (
    <>
      <div
        ref={displayRef}
        class={`display-box implants-display${hasImplants ? " has-implants" : ""}`}
        id="implants-display"
        onClick={() => setIsOpen(true)}
      >
        <span class="text-label-lg implants-label">Armor Implants</span>
        <span class="text-desc-justified implants-desc">
          Subdermal armor and body plating options; <br /> <br /> click to manage
        </span>
        <div class="text-soft implants-list" id="implants-list">
          {hasImplants ? installed.map((i) => i.name).join(", ") : ""}
        </div>
      </div>
      <Popover
        anchorRef={displayRef}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="popover-implants"
      >
        <p class="popover-message">Armor Implants</p>
        <p class="text-desc" style={{ marginBottom: "12px" }}>
          Subdermal armor and body plating. These count as armor layers.
        </p>
        {error && <p class="text-error">{error}</p>}
        <div class="implant-list">
          {templateIds.map((templateId) => {
            const template = templates[templateId];
            const isInstalled = isImplantInstalled(templateId);
            const implantInstance = isInstalled
              ? getInstalledImplants().find((i) => i.templateId === templateId)
              : null;

            const parts = template.bodyParts
              .map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace("_", " "))
              .join(", ");
            const typeLabel = template.type === "hard" ? "Hard" : "Soft";
            let statsText = `${parts} | ${typeLabel}`;
            if (template.ev) statsText += ` | EV -${template.ev}`;

            return (
              <div key={templateId} class={`armor-item${isInstalled ? " armor-worn" : ""}`}>
                <div class="flex-between gap-12 armor-header">
                  <h4>{template.name}</h4>
                  <span class="armor-sp">
                    {isInstalled && implantInstance && implantInstance.spCurrent < template.spMax ? (
                      <>
                        <span class={getConditionClassFromSP(implantInstance.spCurrent, template.spMax)}>
                          {implantInstance.spCurrent}
                        </span>
                        /{template.spMax}
                      </>
                    ) : (
                      `SP ${template.spMax}`
                    )}
                  </span>
                </div>
                <div class="armor-stats">{statsText}</div>
                {template.description && (
                  <div class="text-desc" style={{ marginTop: "4px", fontStyle: "italic" }}>
                    {template.description}
                  </div>
                )}
                <div class="flex-between gap-8 armor-actions">
                  {isInstalled ? (
                    <button
                      class="btn-ghost-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        uninstallImplant(templateId);
                      }}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      class="btn-ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInstall(templateId);
                      }}
                    >
                      Install
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div class="popover-actions">
          <button class="popover-btn popover-btn-cancel" onClick={() => setIsOpen(false)}>
            Close
          </button>
        </div>
      </Popover>
    </>
  );
};
