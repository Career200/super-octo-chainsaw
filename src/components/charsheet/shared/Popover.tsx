import type { ComponentChildren, RefObject } from "preact";
import { createPortal } from "preact/compat";
import { useCallback, useEffect, useRef } from "preact/hooks";

interface Props {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  className?: string;
  children: ComponentChildren;
}

const GAP = 8;

function reposition(popover: HTMLElement, anchor: HTMLElement) {
  const ar = anchor.getBoundingClientRect();

  // Reset so we can measure natural size
  popover.style.inset = "unset";

  const pr = popover.getBoundingClientRect();

  const fitsAbove = ar.top - pr.height - GAP > 0;
  const fitsBelow = ar.bottom + pr.height + GAP < window.innerHeight;

  let top: number;
  if (fitsAbove) {
    top = ar.top - pr.height - GAP;
  } else if (fitsBelow) {
    top = ar.bottom + GAP;
  } else {
    top = Math.max(GAP, (window.innerHeight - pr.height) / 2);
  }

  const left = Math.min(
    Math.max(GAP, ar.left),
    window.innerWidth - pr.width - GAP,
  );

  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
}

export function Popover({
  anchorRef,
  open,
  onClose,
  className,
  children,
}: Props) {
  const popoverRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const popover = popoverRef.current;
    const anchor = anchorRef.current;
    if (!open || !popover || !anchor) return;

    // Position on next frame so the portal DOM is committed and measurable
    const raf = requestAnimationFrame(() => {
      reposition(popover, anchor);
      popover.style.visibility = "";
    });

    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!popover.contains(target) && !anchor.contains(target)) {
        close();
      }
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("click", onClickOutside);
    document.addEventListener("keydown", onKeydown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClickOutside);
      document.removeEventListener("keydown", onKeydown);
    };
  }, [open, anchorRef, close]);

  if (!open) return null;

  const cls = ["popover", className].filter(Boolean).join(" ");

  return createPortal(
    <div
      ref={popoverRef}
      class={cls}
      style={{ position: "fixed", visibility: "hidden" }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  );
}
