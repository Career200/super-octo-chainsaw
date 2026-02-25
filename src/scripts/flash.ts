/** Flash an element by toggling a CSS animation class.
 *  Sets --flash-color if provided, handles reflow restart, self-cleans on animationend. */
export function flashElement(
  el: HTMLElement | null,
  cls: string,
  opts?: { color?: string; clearClasses?: string[] },
): void {
  if (!el) return;
  const clear = opts?.clearClasses ?? [cls];
  for (const c of clear) el.classList.remove(c);
  if (opts?.color) el.style.setProperty("--flash-color", opts.color);
  void el.offsetWidth;
  el.classList.add(cls);
  el.addEventListener(
    "animationend",
    () => {
      for (const c of clear) el.classList.remove(c);
      if (opts?.color) el.style.removeProperty("--flash-color");
    },
    { once: true },
  );
}
