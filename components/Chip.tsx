"use client";

import styles from "./Chip.module.css";

/**
 * Chip — Figma component set 162:74.
 *
 * ⚠️ THE SHAPE IS THE CONTRACT. A chip is MULTI-SELECT in pill form, so it
 * carries `role="checkbox"`, not `role="radio"`. There is no single-select Chip
 * variant in the library; if a question is single-select it uses Radio rows,
 * even where a wireframe drew pills.
 *
 * Chips suit short labels (symptoms). For long ones such as "Perioral
 * dermatitis" use a Checkbox row instead.
 */
export function Chip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      data-selected={selected}
      className={`${styles.chip} t-label`}
      onClick={onToggle}
    >
      {label}
    </button>
  );
}
