import { createPopover } from "./base";

export interface ConfirmOptions {
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "confirm" | "danger" | "info";
  backdrop?: boolean;
}

export function confirm(
  anchor: HTMLElement,
  options: ConfirmOptions,
): Promise<boolean> {
  return new Promise((resolve) => {
    const {
      message,
      confirmText = "Confirm",
      cancelText = "Cancel",
      type = "confirm",
      backdrop = true,
    } = options;

    const { popover, cleanup, reposition } = createPopover(anchor, {
      backdrop,
      className: `popover-${type}`,
      onDismiss: () => resolve(false),
    });

    const msg = document.createElement("p");
    msg.className = "popover-message";
    msg.textContent = message;

    const actions = document.createElement("div");
    actions.className = "popover-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "popover-btn popover-btn-cancel";
    cancelBtn.textContent = cancelText;
    cancelBtn.addEventListener("click", () => {
      cleanup();
      resolve(false);
    });

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "popover-btn popover-btn-confirm";
    confirmBtn.textContent = confirmText;
    confirmBtn.addEventListener("click", () => {
      cleanup();
      resolve(true);
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    popover.appendChild(msg);
    popover.appendChild(actions);

    reposition();
  });
}
