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

    const content = `
      <p class="popover-message">${message}</p>
      <div class="popover-actions">
        <button class="popover-btn popover-btn-cancel">${cancelText}</button>
        <button class="popover-btn popover-btn-confirm">${confirmText}</button>
      </div>
    `;

    const { popover, cleanup } = createPopover(anchor, content, {
      backdrop,
      className: `popover-${type}`,
      onDismiss: () => resolve(false),
    });

    popover
      .querySelector(".popover-btn-confirm")!
      .addEventListener("click", () => {
        cleanup();
        resolve(true);
      });

    popover
      .querySelector(".popover-btn-cancel")!
      .addEventListener("click", () => {
        cleanup();
        resolve(false);
      });
  });
}
