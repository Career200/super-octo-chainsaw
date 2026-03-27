import { useRef, useState } from "preact/hooks";

export function usePopoverState() {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return { ref, open, setOpen };
}
