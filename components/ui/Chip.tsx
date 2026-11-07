"use client";

import type { ReactNode } from "react";
import styles from "./Chip.module.css";

/** Chip — Figma component set 162:74. */
export function Chip({
  label,
  selected,
  control = "checkbox",
  size = "default",
  tone = "brand",
  disabled = false,
  muted = false,
  icon,
  onToggle,
}: {
  label: string;
  selected: boolean;
  control?: "checkbox" | "radio";
  /**
   * The pill's size and label style. `compact` is the chat panel's — see the
   * note above, and raise it in Figma before reusing it.
   */
  size?: "default" | "compact" | "small";
  /** The SELECTED fill. */
  tone?: "brand" | "teal";
  disabled?: boolean;
  muted?: boolean;
  /** a leading glyph from `icons.tsx`, the way the reference's option chips carry one */
  icon?: ReactNode;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role={control}
      aria-checked={selected}
      data-selected={selected}
      data-size={size === "default" ? undefined : size}
      data-tone={tone === "teal" ? "teal" : undefined}
      data-muted={selected && muted ? "" : undefined}
      disabled={disabled}
      /* still a `t-*` class at every size — rule 3 holds for all three */
      className={`${styles.chip} ${size === "compact" ? "t-label-sm" : size === "small" ? "t-caption" : "t-chip"}`}
      onClick={onToggle}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {label}
    </button>
  );
}
