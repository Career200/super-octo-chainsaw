export interface CreatePopoverOptions {
  backdrop?: boolean;
  className?: string;
  onDismiss?: () => void;
  /** stack on top of existing popovers? */
  stack?: boolean;
}

export interface PopoverInstance {
  popover: HTMLElement;
  cleanup: () => void;
  reposition: () => void;
}

interface StackEntry {
  popover: HTMLElement;
  overlay: HTMLElement | null;
  anchor: HTMLElement;
  dismiss: () => void;
}

const popoverStack: StackEntry[] = [];

function onGlobalKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && popoverStack.length > 0) {
    popoverStack[popoverStack.length - 1].dismiss();
  }
}

function onGlobalClick(e: MouseEvent) {
  if (popoverStack.length === 0) return;

  const target = e.target as Node;

  const isInside = popoverStack.some(
    (entry) =>
      entry.popover.contains(target) ||
      entry.overlay?.contains(target) ||
      entry.anchor.contains(target),
  );

  if (!isInside) {
    closeAll();
  }
}

function setupGlobalListeners() {
  document.addEventListener("keydown", onGlobalKeydown);
  document.addEventListener("click", onGlobalClick);
}

function teardownGlobalListeners() {
  document.removeEventListener("keydown", onGlobalKeydown);
  document.removeEventListener("click", onGlobalClick);
}

export function createPopover(
  anchor: HTMLElement,
  options: CreatePopoverOptions = {},
): PopoverInstance {
  const {
    backdrop = false,
    className = "",
    onDismiss,
    stack = false,
  } = options;

  if (!stack) {
    closeAll();
  }

  if (popoverStack.length === 0) {
    setTimeout(setupGlobalListeners, 0);
  }

  let overlay: HTMLElement | null = null;
  if (backdrop) {
    overlay = document.createElement("div");
    overlay.className = "popover-overlay";
    document.body.appendChild(overlay);
  }

  const popover = document.createElement("div");
  popover.className = `popover ${className}`.trim();
  popover.setAttribute("popover", "manual");
  document.body.appendChild(popover);

  const reposition = () => positionPopover(popover, anchor);

  const cleanup = () => {
    const index = popoverStack.findIndex((e) => e.popover === popover);
    if (index === -1) return;

    while (popoverStack.length > index + 1) {
      popoverStack[popoverStack.length - 1].dismiss();
    }

    popoverStack.pop();

    popover.hidePopover();
    popover.remove();
    overlay?.removeEventListener("click", dismiss);
    overlay?.remove();

    if (popoverStack.length === 0) {
      teardownGlobalListeners();
    }
  };

  const dismiss = () => {
    cleanup();
    onDismiss?.();
  };

  const entry: StackEntry = { popover, overlay, anchor, dismiss };
  popoverStack.push(entry);

  if (overlay) {
    overlay.addEventListener("click", dismiss);
  }

  popover.addEventListener("click", (e) => e.stopPropagation());

  requestAnimationFrame(reposition);

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

export function closeAll() {
  while (popoverStack.length > 0) {
    popoverStack[popoverStack.length - 1].dismiss();
  }
}
