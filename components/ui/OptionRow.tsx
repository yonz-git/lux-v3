"use client";

import styles from "./OptionRow.module.css";

/**
 * Radio row (162:86) and Checkbox row (465:463) — one component, because the
 * two are identical in every respect EXCEPT the selector shape.
 */
export function OptionRow({
  control,
  label,
  selected,
  onSelect,
}: {
  control: "radio" | "checkbox";
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role={control}
      aria-checked={selected}
      data-selected={selected}
      className={styles.row}
      onClick={onSelect}
    >
      <span className={`${styles.label} t-label`}>{label}</span>
      <span className={styles.selector} data-shape={control} aria-hidden="true">
        {control === "checkbox" && selected && (
          /* aria-hidden on the svg itself, as every glyph in `icons.tsx` is.
             The parent span already hides it, but the rule reads the element,
             and so does anything else that inspects one svg in isolation. */
          <svg viewBox="0 0 11 8" fill="none" className={styles.check} aria-hidden="true">
            <path
              d="M1 4L4 7L10 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
