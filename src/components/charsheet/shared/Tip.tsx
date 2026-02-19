import { useState, useRef, useCallback } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { createPortal } from "preact/compat";
import { cls } from ".";

interface Props {
  label: string;
  class?: string;
  children: ComponentChildren;
}

export function Tip({ label, class: className, children }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const show = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.top, left: r.left + 2 });
  }, []);

  const hide = useCallback(() => setPos(null), []);

  return (
    <span
      class={cls("tip", className)}
      ref={ref}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {pos && createPortal(
        <span
          class="tip-popover"
          style={{
            position: "fixed",
            top: `${pos.top}px`,
            left: `${pos.left}px`,
            transform: "translateY(-100%) translateY(-4px)",
          }}
        >
          {label}
        </span>,
        document.body,
      )}
    </span>
  );
}
