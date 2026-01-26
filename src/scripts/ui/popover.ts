export interface PopoverOptions {
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "confirm" | "danger" | "info";
}

let activePopover: HTMLElement | null = null;

export function confirm(
  anchor: HTMLElement,
  options: PopoverOptions,
): Promise<boolean> {
  return new Promise((resolve) => {
    closeActivePopover();

    const {
      message,
      confirmText = "Confirm",
      cancelText = "Cancel",
      type = "confirm",
    } = options;

    const popover = document.createElement("div");
    popover.className = `popover popover-${type}`;
    popover.setAttribute("popover", "manual");

    popover.innerHTML = `
      <p class="popover-message">${message}</p>
      <div class="popover-actions">
        <button class="popover-btn popover-btn-cancel">${cancelText}</button>
        <button class="popover-btn popover-btn-confirm">${confirmText}</button>
      </div>
    `;

    document.body.appendChild(popover);
    activePopover = popover;

    positionPopover(popover, anchor);

    const confirmBtn = popover.querySelector(".popover-btn-confirm")!;
    confirmBtn.addEventListener("click", () => {
      cleanup();
      resolve(true);
    });

    const cancelBtn = popover.querySelector(".popover-btn-cancel")!;
    cancelBtn.addEventListener("click", () => {
      cleanup();
      resolve(false);
    });

    const onClickOutside = (e: MouseEvent) => {
      if (!popover.contains(e.target as Node) && e.target !== anchor) {
        cleanup();
        resolve(false);
      }
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cleanup();
        resolve(false);
      }
    };

    // Delay adding listeners to avoid immediate trigger
    setTimeout(() => {
      document.addEventListener("click", onClickOutside);
      document.addEventListener("keydown", onKeydown);
    }, 0);

    function cleanup() {
      document.removeEventListener("click", onClickOutside);
      document.removeEventListener("keydown", onKeydown);
      popover.hidePopover();
      popover.remove();
      activePopover = null;
    }
  });
}

function positionPopover(popover: HTMLElement, anchor: HTMLElement) {
  const anchorRect = anchor.getBoundingClientRect();
  const padding = 8;

  popover.style.inset = "unset";
  popover.style.position = "fixed";

  // Show first so we can measure (popover API requires this)
  popover.showPopover();
  const popoverRect = popover.getBoundingClientRect();

  const fitsAbove = anchorRect.top - popoverRect.height - padding > 0;
  const fitsBelow =
    anchorRect.bottom + popoverRect.height + padding < window.innerHeight;

  let top: number;
  if (fitsAbove) {
    top = anchorRect.top - popoverRect.height - padding;
  } else if (fitsBelow) {
    top = anchorRect.bottom + padding;
  } else {
    top = Math.max(padding, (window.innerHeight - popoverRect.height) / 2);
  }

  const left = Math.min(
    Math.max(padding, anchorRect.left),
    window.innerWidth - popoverRect.width - padding,
  );

  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
}

function closeActivePopover() {
  if (activePopover) {
    activePopover.hidePopover();
    activePopover.remove();
    activePopover = null;
  }
}

function injectStyles() {
  if (document.getElementById("popover-styles")) return;

  const style = document.createElement("style");
  style.id = "popover-styles";
  style.textContent = `
    .popover {
      background: var(--bg-alt, #1a1c1f);
      border: 1px solid var(--border, #2f3237);
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      min-width: 200px;
      max-width: 300px;
      z-index: 1000;
    }

    .popover::backdrop {
      background: rgba(0, 0, 0, 0.3);
    }

    .popover-danger {
      border-color: #c44;
    }

    .popover-message {
      margin: 0 0 12px 0;
      color: var(--fg, #c4f2e6);
      font-size: 14px;
    }

    .popover-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .popover-btn {
      padding: 6px 14px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-family: inherit;
      transition: background 0.15s, color 0.15s;
    }

    .popover-btn-cancel {
      background: transparent;
      border: 1px solid var(--border-light, #2a2d32);
      color: var(--fg-soft, #aaa);
    }

    .popover-btn-cancel:hover {
      border-color: var(--fg-soft, #aaa);
      color: var(--fg, #c4f2e6);
    }

    .popover-btn-confirm {
      background: var(--accent, #00ffcc);
      color: #000;
    }

    .popover-btn-confirm:hover {
      background: var(--link, #00f0ff);
    }

    .popover-danger .popover-btn-confirm {
      background: #c44;
      color: #fff;
    }

    .popover-danger .popover-btn-confirm:hover {
      background: #e55;
    }

    .popover-notify {
      min-width: 150px;
    }

    .popover-notify .popover-message {
      margin: 0;
    }

    .popover-notify-error {
      border-color: #c44;
    }

    .popover-notify-error .popover-message {
      color: #f88;
    }

    .popover-notify-success {
      border-color: var(--accent, #00ffcc);
    }

    .popover-notify-success .popover-message {
      color: var(--accent, #00ffcc);
    }
  `;
  document.head.appendChild(style);
}

// --- Notify (non-blocking notification) ---

export interface NotifyOptions {
  message: string;
  type?: "error" | "info" | "success";
  duration?: number;
}

export function notify(
  anchor: HTMLElement,
  options: NotifyOptions,
): void {
  closeActivePopover();

  const { message, type = "info", duration = 3000 } = options;

  const popover = document.createElement("div");
  popover.className = `popover popover-notify popover-notify-${type}`;
  popover.setAttribute("popover", "manual");

  popover.innerHTML = `<p class="popover-message">${message}</p>`;

  document.body.appendChild(popover);
  activePopover = popover;

  positionPopover(popover, anchor);

  const cleanup = () => {
    popover.hidePopover();
    popover.remove();
    if (activePopover === popover) {
      activePopover = null;
    }
  };

  const onClickOutside = (e: MouseEvent) => {
    if (!popover.contains(e.target as Node)) {
      document.removeEventListener("click", onClickOutside);
      cleanup();
    }
  };

  setTimeout(() => {
    document.addEventListener("click", onClickOutside);
  }, 0);

  setTimeout(() => {
    document.removeEventListener("click", onClickOutside);
    cleanup();
  }, duration);
}

// Auto-inject styles when module loads
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectStyles);
  } else {
    injectStyles();
  }
}
