import type { ComponentChildren } from "preact";
import { useRef, useState } from "preact/hooks";

import { Chevron } from "../../shared/Chevron";
import { ConfirmPopover } from "../../shared/ConfirmPopover";
import { Popover } from "../../shared/Popover";

interface Props {
  expanded: boolean;
  onToggle: () => void;
  headerLabel: string;
  hasContent: boolean;
  hintText: string;
  adding: boolean;
  onAdd?: () => string | null; // returns error message, or null on success
  isCustom: boolean;
  removeName?: string;
  onRemove?: () => void;
  headerActions?: ComponentChildren;
  children: ComponentChildren;
}

export function BottomBarItemShell({
  expanded,
  onToggle,
  headerLabel,
  hasContent,
  hintText,
  adding,
  onAdd,
  isCustom,
  removeName,
  onRemove,
  headerActions,
  children,
}: Props) {
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const removeBtnRef = useRef<HTMLButtonElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!hasContent) {
    return (
      <div class="bottom-bar-row">
        <span class="bottom-bar-hint">{hintText}</span>
      </div>
    );
  }

  return (
    <>
      <div class="bottom-bar-row expandable" onClick={onToggle}>
        <div class="bottom-bar-content">
          <span class="bottom-bar-name">{headerLabel}</span>
        </div>
        <div class="bottom-bar-actions">
          {headerActions}
          {adding && onAdd && (
            <>
              <button
                ref={addBtnRef}
                class="bar-action"
                onClick={(e) => {
                  e.stopPropagation();
                  const err = onAdd();
                  setAddError(err);
                }}
              >
                Add
              </button>
              <Popover
                anchorRef={addBtnRef}
                open={addError !== null}
                onClose={() => setAddError(null)}
                className="popover-info"
              >
                <p class="popover-message">{addError}</p>
              </Popover>
            </>
          )}
          {isCustom && !adding && onRemove && (
            <>
              <button
                ref={removeBtnRef}
                class="bar-action bar-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmOpen(true);
                }}
              >
                Remove
              </button>
              <ConfirmPopover
                anchorRef={removeBtnRef}
                open={confirmOpen}
                message={`Remove ${removeName}?`}
                confirmText="Remove"
                cancelText="Keep"
                type="danger"
                onConfirm={() => {
                  setConfirmOpen(false);
                  onRemove();
                }}
                onCancel={() => setConfirmOpen(false)}
              />
            </>
          )}
          <Chevron expanded={expanded} />
        </div>
      </div>
      {expanded && <div class="bottom-bar-body">{children}</div>}
    </>
  );
}
