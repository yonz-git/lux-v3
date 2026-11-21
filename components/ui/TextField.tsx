"use client";

import type { InputHTMLAttributes, Ref } from "react";
import styles from "./TextField.module.css";

/** A single-line text input. */
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
