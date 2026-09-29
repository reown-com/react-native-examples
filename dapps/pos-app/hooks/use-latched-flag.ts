import { useState } from "react";

/**
 * Returns `true` from the first render where `value` is `true`, and stays
 * `true` for the rest of the component's lifetime, even if `value` flips back.
 *
 * Uses React's "adjust state during render" pattern rather than a ref or an
 * effect, which the react-hooks lint rules reject.
 *
 * @example
 *
 * const hideBack = useLatchedFlag(status === "processing");
 *  */
export function useLatchedFlag(value: boolean): boolean {
  const [latched, setLatched] = useState(value);
  if (value && !latched) {
    setLatched(true);
  }
  return latched || value;
}
