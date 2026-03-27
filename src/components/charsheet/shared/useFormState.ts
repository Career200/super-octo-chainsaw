import { useCallback, useRef, useState } from "preact/hooks";

/** Typed multi-field state with one-call reset. Initial values captured by ref. */
export function useFormState<T extends Record<string, unknown>>(initial: T) {
  const initialRef = useRef(initial);
  const [state, setState] = useState(initial);

  const setField = useCallback(
    <K extends keyof T>(key: K, value: T[K]) =>
      setState((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => setState(initialRef.current), []);

  return { fields: state, setField, reset };
}
