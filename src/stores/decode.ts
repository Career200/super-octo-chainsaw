/** Simple JSON decode for persistentAtom — trusts our own writes. */
export function decodeJson<T>(fallback: T): (raw: string) => T {
  return (raw: string): T => {
    try {
      return JSON.parse(raw) ?? fallback;
    } catch {
      return fallback;
    }
  };
}
