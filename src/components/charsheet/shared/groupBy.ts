/**
 * Group items by a key and return ordered [key, items][] tuples.
 *
 * - With `order`: returns groups in that order, skipping missing keys.
 *   Unknown keys (not in `order`) are appended at the end alphabetically.
 * - Without `order`: returns groups sorted alphabetically by key.
 */
export function groupBy<T>(
  items: T[],
  getKey: (item: T) => string,
  order?: readonly string[],
): [string, T[]][] {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const key = getKey(item);
    const list = grouped.get(key);
    if (list) list.push(item);
    else grouped.set(key, [item]);
  }

  if (!order) {
    return [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }

  const result: [string, T[]][] = [];
  const seen = new Set<string>();
  for (const key of order) {
    const list = grouped.get(key);
    if (list) {
      result.push([key, list]);
      seen.add(key);
    }
  }
  // Append any keys not in the order array
  for (const [key, list] of grouped) {
    if (!seen.has(key)) result.push([key, list]);
  }
  return result;
}
