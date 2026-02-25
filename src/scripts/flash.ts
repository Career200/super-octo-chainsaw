/** Flash an element by toggling a CSS animation class.
 *  Handles reflow restart for rapid re-triggers and self-cleans on animationend. */
export function flashElement(
  el: HTMLElement | null,
  cls: string,
  clearClasses?: string[],
): void {
  if (!el) return;
  for (const c of clearClasses ?? [cls]) el.classList.remove(c);
  void el.offsetWidth;
  el.classList.add(cls);
  el.addEventListener(
    "animationend",
    () => {
      for (const c of clearClasses ?? [cls]) el.classList.remove(c);
    },
    { once: true },
  );
}
