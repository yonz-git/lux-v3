"use client";

import styles from "./OptionRow.module.css";

/**
 * Radio row (162:86) and Checkbox row (465:463) — one component, because the
 * two are identical in every respect EXCEPT the selector shape.
 *
 * ⚠️ THE SHAPE IS THE CONTRACT, not a style choice:
 *   circle = exactly one   -> role="radio"
 *   square = zero or more  -> role="checkbox"
 * Users read the shape before they interact, and screen readers announce them
 * differently ("radio button, 1 of 7" vs "checkbox, not checked"). Never use
 * one to do the other's job.
 *
 * Most LUX questions are multi-select, so `checkbox` is the common one.
 *
 * EXCLUSIVE OPTIONS ("None", "Not sure", "Prefer not to say") stay checkboxes
 * and keep role="checkbox" — the group is still multi-select. They clear the
 * rest in the handler, never by changing role. See useExclusiveGroup below.
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
          <svg viewBox="0 0 11 8" fill="none" className={styles.check}>
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
