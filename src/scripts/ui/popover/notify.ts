import { createPopover } from "./base";

export interface NotifyOptions {
  message: string;
  type?: "error" | "info" | "success";
  duration?: number;
  backdrop?: boolean;
}

export function notify(anchor: HTMLElement, options: NotifyOptions): void {
  const { message, type = "info", duration = 3000, backdrop = false } = options;

  const content = `<p class="popover-message">${message}</p>`;

  const { cleanup } = createPopover(anchor, content, {
    backdrop,
    className: `popover-notify popover-notify-${type}`,
  });

  setTimeout(cleanup, duration);
}
