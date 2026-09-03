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
 */
export function TextField({
  className,
  ref,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return (
    <input
      ref={ref}
      type="text"
      className={[styles.field, "t-body2", className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}
