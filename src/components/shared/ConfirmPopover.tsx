import type { RefObject } from "preact";
import { Popover } from "./Popover";

interface Props {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "confirm" | "danger" | "info";
}

export const ConfirmPopover = ({
  anchorRef,
  open,
  onConfirm,
  onCancel,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "confirm",
}: Props) => {
  return (
    <Popover
      anchorRef={anchorRef}
      open={open}
      onClose={onCancel}
      className={`popover-${type}`}
    >
      <p class="popover-message">{message}</p>
      <div class="popover-actions">
        <button class="popover-btn popover-btn-cancel" onClick={onCancel}>
          {cancelText}
        </button>
        <button class="popover-btn popover-btn-confirm" onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </Popover>
  );
};
