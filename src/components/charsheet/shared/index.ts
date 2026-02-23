import type { ComponentType } from "preact";
import { lazy } from "preact/compat";

export { ConfirmPopover } from "./ConfirmPopover";
export { HelpPopover } from "./HelpPopover";
export { Panel } from "./Panel";
export { Popover } from "./Popover";
export { Tip } from "./Tip";

export function cls(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** Lazy-load a named export as a Preact component. */
export function lazyNamed<
  T extends Record<string, ComponentType<never>>,
  K extends keyof T,
>(load: () => Promise<T>, name: K) {
  return lazy(() => load().then((m) => ({ default: m[name] })));
}
