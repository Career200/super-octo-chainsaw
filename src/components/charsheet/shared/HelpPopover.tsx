import type { ComponentChildren } from "preact";

import { Popover } from "./Popover";
import { usePopoverState } from "./usePopoverState";

interface Props {
  id: string;
  content: ComponentChildren;
}

export const HelpPopover = ({ id, content }: Props) => {
  const { ref, open, setOpen } = usePopoverState();

  return (
    <>
      <button
        ref={ref}
        class="help-trigger"
        id={id}
        type="button"
        aria-label="Help"
        onClick={() => setOpen(!open)}
      >
        ?
      </button>
      <Popover
        anchorRef={ref}
        open={open}
        onClose={() => setOpen(false)}
        className="popover-help"
      >
        {content}
      </Popover>
    </>
  );
};
