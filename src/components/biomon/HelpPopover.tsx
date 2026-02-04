import { useState, useRef, useEffect } from "preact/hooks";
import type { ComponentChildren } from "preact";

interface Props {
  id: string;
  content: ComponentChildren;
}

export const HelpPopover = ({ id, content }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        class="help-trigger"
        id={id}
        type="button"
        aria-label="Help"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        ?
      </button>
      {isOpen && (
        <div ref={popoverRef} class="popover popover-help">
          {content}
        </div>
      )}
    </>
  );
};
