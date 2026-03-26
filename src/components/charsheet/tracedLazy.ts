// Temporary: drop-in replacement for lazy() that logs chunk load timing.
// Usage: replace `lazy(() => import("./Foo"))` with `tracedLazy("Foo", () => import("./Foo"))`
// Remove this file when done profiling.
import { lazy } from "preact/compat";

export function tracedLazy<T extends { default: any }>(
  name: string,
  factory: () => Promise<T>,
) {
  return lazy(() => {
    const t0 = performance.now();
    console.log(`[lazy] ${name} — loading`);
    return factory().then((m) => {
      console.log(`[lazy] ${name} — ready in ${(performance.now() - t0).toFixed(1)}ms`);
      return m;
    });
  });
}
