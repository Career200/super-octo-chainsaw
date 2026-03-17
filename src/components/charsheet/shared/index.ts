export { ConfirmPopover } from "./ConfirmPopover";
export { groupBy } from "./groupBy";
export { HelpPopover } from "./HelpPopover";
export { Panel } from "./Panel";
export { Popover } from "./Popover";
export { Tip } from "./Tip";
export { useCollapsibleGroups } from "./useCollapsibleGroups";
export { useDebouncedCallback } from "./useDebouncedCallback";
export { useEditToggle } from "./useEditToggle";
export { useFormState } from "./useFormState";
export { usePopoverState } from "./usePopoverState";

export function cls(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** Parse a numeric string, returning fallback for empty or invalid input. */
export function parseNum(s: string, fallback: number): number {
  const n = Number(s);
  return s === "" || isNaN(n) ? fallback : n;
}
