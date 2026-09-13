"use client";

import type { InputHTMLAttributes, Ref } from "react";
import styles from "./TextField.module.css";

/**
 * A single-line text input.
 *
 * ⚠️ THE DESIGN SYSTEM HAS NO TEXT FIELD COMPONENT. `Search Field` (248:70)
 * exists and is used for search, but the `other-input` on 02c/03a and the date
 * field on 03c are all hand-composed from the frosted-row recipe in Figma. This
 * component is the code-side equivalent so at least the prototype has one
 * definition rather than three. Adding a real Figma component would let the two
 * converge — it is on the missing-from-the-DS list.
 *
 * Recipe (read off `other-input`): surface/frost-light + 1px border/default +
 * radius/lg + the surface/frosted-row inner shadow, 56 tall (58 desktop),
 * padding 0/18 (0/20 desktop), placeholder Body 2 in text/muted.
 *
 * ⚠️ NOT IN FIGMA — THE INPUT IS WRAPPED, AND `className` GOES ON THE WRAPPER,
 * as of 13 Sep 2026. The focus ring is `SearchField`'s gradient ring, asked
 * for directly ("just like the search bar"), and that ring is a masked
 * `::after` — which an `<input>` cannot have, being a replaced element. The
 * only caller `className` is `reveal-quick`, an entrance, which reads the same
 * on the wrapper. `ref` and every other attribute still reach the input.
 */
export function TextField({
  className,
  ref,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return (
    <span className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <input ref={ref} type="text" className={`${styles.field} t-body2`} {...rest} />
    </span>
  );
}
