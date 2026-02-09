import { useState, useRef } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { Popover } from "./Popover";

interface Props {
  id: string;
  content: ComponentChildren;
}

export const HelpPopover = ({ id, content }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={buttonRef}
        class="help-trigger"
        id={id}
        type="button"
        aria-label="Help"
        onClick={() => setIsOpen(!isOpen)}
      >
        ?
      </button>
      <Popover
        anchorRef={buttonRef}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="popover-help"
      >
        {content}
      </Popover>
    </>
  );
};
