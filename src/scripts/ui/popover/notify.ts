import { createPopover } from "./base";

export interface NotifyOptions {
  message: string;
  type?: "error" | "info" | "success";
  duration?: number;
  backdrop?: boolean;
}

export function notify(anchor: HTMLElement, options: NotifyOptions): void {
  const { message, type = "info", duration = 3000, backdrop = false } = options;

  const { popover, cleanup, reposition } = createPopover(anchor, {
    backdrop,
    className: `popover-notify popover-notify-${type}`,
    stack: true,
  });

  const msg = document.createElement("p");
  msg.className = "popover-message";
  msg.textContent = message;
  popover.appendChild(msg);

  reposition();

  setTimeout(cleanup, duration);
}
