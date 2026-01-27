export interface CreatePopoverOptions {
  backdrop?: boolean;
  className?: string;
  onDismiss?: () => void;
}

export interface PopoverInstance {
  popover: HTMLElement;
  cleanup: () => void;
  reposition: () => void;
}

let activePopover: HTMLElement | null = null;
let activeOverlay: HTMLElement | null = null;

export function createPopover(
  anchor: HTMLElement,
  options: CreatePopoverOptions = {},
): PopoverInstance {
  closeActivePopover();

  const { backdrop = false, className = "", onDismiss } = options;

  let overlay: HTMLElement | null = null;
  if (backdrop) {
    overlay = document.createElement("div");
    overlay.className = "popover-overlay";
    document.body.appendChild(overlay);
    activeOverlay = overlay;
  }

  const popover = document.createElement("div");
  popover.className = `popover ${className}`.trim();
  popover.setAttribute("popover", "manual");

  document.body.appendChild(popover);
  activePopover = popover;

  const reposition = () => positionPopover(popover, anchor);

  let onClickOutside: ((e: MouseEvent) => void) | null = null;

  const cleanup = () => {
    document.removeEventListener("keydown", onKeydown);
    if (onClickOutside) {
      document.removeEventListener("click", onClickOutside);
    }
    popover.hidePopover();
    popover.remove();
    if (overlay) {
      overlay.remove();
      activeOverlay = null;
    }
    if (activePopover === popover) {
      activePopover = null;
    }
  };

  const dismiss = () => {
    cleanup();
    onDismiss?.();
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      dismiss();
    }
  };

  if (overlay) {
    overlay.addEventListener("click", dismiss);
  } else {
    onClickOutside = (e: MouseEvent) => {
      if (!popover.contains(e.target as Node) && e.target !== anchor) {
        dismiss();
      }
    };
    setTimeout(() => {
      document.addEventListener("click", onClickOutside!);
    }, 0);
  }

  document.addEventListener("keydown", onKeydown);

  return { popover, cleanup, reposition };
}

function positionPopover(popover: HTMLElement, anchor: HTMLElement) {
  const anchorRect = anchor.getBoundingClientRect();
  const padding = 8;

  popover.style.inset = "unset";
  popover.style.position = "fixed";

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
  if (activeOverlay) {
    activeOverlay.remove();
    activeOverlay = null;
  }
  if (activePopover) {
    activePopover.hidePopover();
    activePopover.remove();
    activePopover = null;
  }
}
