"use client";

import type { ReactNode } from "react";
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
 * ⚠️ `size="compact"` IS THE CHAT PANEL'S CHIP AND NOTHING ELSE'S. 40 tall
 * becomes 32 and the label drops a ramp step, `Label` (14/20) to `Label Small`
 * (12/16), both Medium. It exists because the check-in moved inside
 * `ChatPanel`, a 375 surface where a 40-tall pill row wraps a five-option scale
 * onto three lines and stops reading as a row of answers.
 *
 * ⚠️ THE 44 TAP TARGET IS UNCHANGED, and that is the point of `::after` in the
 * stylesheet: it extends the hit region beyond the pill rather than padding the
 * pill out to 44, so shrinking the drawn control does not shrink what a finger
 * has to find. A compact chip is 32 to the eye and 44 to the thumb.
 *
 * ⚠️ RAISE IT IN FIGMA AS A SIZE VARIANT ON 162:74. The frame does not draw a
 * small chip; this is a decided-here size, like the radio variant above it, and
 * the DEFAULT is untouched so every chip outside the panel is still 40/14.
 *
 * ⚠️ `disabled` IS NOT IN FIGMA EITHER — 162:74 draws no disabled state. Added
 * 14 Sep 2026 for step 1, where every symptom but the one being placed waits
 * while its places are marked. It is the Button's disabled recipe rather than a
 * new one (non-negotiable 5): the whole pill at `opacity/disabled`, selected or
 * not, on a real `disabled` attribute so the pill leaves the tab order. Raise it
 * in Figma alongside the size and radio variants above.
 *
 * Chips suit short labels (symptoms). For long ones such as "Perioral
 * dermatitis" use a Checkbox row instead.
 */
export function Chip({
  label,
  selected,
  control = "checkbox",
  size = "default",
  disabled = false,
  icon,
  onToggle,
}: {
  label: string;
  selected: boolean;
  /**
   * `checkbox` (default) for a multi-select group; `radio` for a single-select
   * one, whose caller MUST wrap the chips in `role="radiogroup"`. See above.
   */
  control?: "checkbox" | "radio";
  /**
   * The pill's size and label style. `compact` is the chat panel's — see the
   * note above, and raise it in Figma before reusing it.
   */
  size?: "default" | "compact";
  /** unavailable for now — see the note above */
  disabled?: boolean;
  /** a leading glyph from `icons.tsx`, the way VidGen's option chips carry one */
  icon?: ReactNode;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role={control}
      aria-checked={selected}
      data-selected={selected}
      data-size={size === "compact" ? "compact" : undefined}
      disabled={disabled}
      /* still a `t-*` class either way — rule 3 holds for both sizes */
      className={`${styles.chip} ${size === "compact" ? "t-label-sm" : "t-chip"}`}
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
