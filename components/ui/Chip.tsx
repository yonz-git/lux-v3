"use client";

import styles from "./Chip.module.css";

/**
 * Chip — Figma component set 162:74.
 *
 * ⚠️ THE ROLE IS THE CONTRACT, AND A CHIP NOW HAS TWO. A chip defaults to
 * MULTI-SELECT — `role="checkbox"`, the only thing 162:74 encodes. `control`
 * switches it to `role="radio"` for a single-select group.
 *
 * ⚠️ THE RADIO VARIANT IS NOT IN THE DESIGN SYSTEM. It is the alternative
 * `Timing.tsx` has named from the start: "the library has no single-select Chip
 * variant; adding one is the alternative if the pill look is ever wanted back."
 * The daily check-in wanted it back, so it exists now — as a ROLE change with
 * no visual change at all, which is the whole point. The pill is the pill; what
 * moves is what a screen reader announces ("radio button, 3 of 5" rather than
 * "checkbox, not checked") and what the group enforces.
 *
 * ⚠️ THIS BENDS "THE SHAPE IS THE CONTRACT". AGENTS.md maps circle to exactly
 * one, square to zero or more, and pill to zero or more — so a single-select
 * pill is a shape doing a job the table gives to a circle. It is deliberate and
 * it is scoped: the caller must supply a real `role="radiogroup"` so the
 * cardinality is announced by the GROUP even though the pill does not draw it.
 * Do not reach for this to make an ordinary multi-select look tidier — the only
 * reason it exists is a question whose answers are a short ordinal scale, where
 * five full-width rows spend a screen's height on five one-word labels.
 * **Raise a single-select Chip variant in Figma** rather than widening this.
 *
 * Chips suit short labels (symptoms). For long ones such as "Perioral
 * dermatitis" use a Checkbox row instead.
 */
export function Chip({
  label,
  selected,
  control = "checkbox",
  onToggle,
}: {
  label: string;
  selected: boolean;
  /**
   * `checkbox` (default) for a multi-select group; `radio` for a single-select
   * one, whose caller MUST wrap the chips in `role="radiogroup"`. See above.
   */
  control?: "checkbox" | "radio";
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role={control}
      aria-checked={selected}
      data-selected={selected}
      className={`${styles.chip} t-label`}
      onClick={onToggle}
    >
      {label}
    </button>
  );
}
