import type { ComponentChildren } from "preact";

import { ConfirmPopover } from "@components/charsheet/shared/ConfirmPopover";
import { usePopoverState } from "@components/charsheet/shared/usePopoverState";

interface Props {
  /** Template mode: show Take button */
  showAcquire?: boolean;
  onAcquire?: (e: MouseEvent) => void;
  /** Owned mode: show Discard button with confirm popover */
  showDiscard?: boolean;
  discardName?: string;
  onDiscard?: () => void;
  /** Domain-specific buttons between acquire and discard */
  children?: ComponentChildren;
}

export function AcquireDiscardActions({
  showAcquire,
  onAcquire,
  showDiscard,
  discardName,
  onDiscard,
  children,
}: Props) {
  const {
    ref: discardBtnRef,
    open: confirmOpen,
    setOpen: setConfirmOpen,
  } = usePopoverState();

  if (showAcquire && onAcquire) {
    return (
      <button class="bar-action" onClick={onAcquire}>
        Take
      </button>
    );
  }

  if (!showDiscard) return <>{children}</>;

  return (
    <>
      {children}
      <button
        ref={discardBtnRef}
        class="bar-action bar-remove"
        onClick={(e) => {
          e.stopPropagation();
          setConfirmOpen(true);
        }}
      >
        Discard
      </button>
      <ConfirmPopover
        anchorRef={discardBtnRef}
        open={confirmOpen}
        message={`Discard ${discardName}?`}
        confirmText="Discard"
        cancelText="Keep"
        type="danger"
        onConfirm={() => {
          onDiscard?.();
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
