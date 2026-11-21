/**
 * Segmented Toggle — a two-option pill switcher.
 *
 * Figma node 75:23 ("Pattern / Segmented Toggle") in the Lux file
 * (wIftBhzkn8E4wjZwgdH71n). Backdrop-blur frosted container with a gradient
 * pill that highlights the selected option.
 *
 * The selected segment uses `gradient/brand` (#657792 → #39386f) with
 * `text/on-brand` (white); unselected shows `text/secondary` on transparent.
 * Gradient animation reuses the registered `--grad-start` / `--grad-end`
 * properties from globals.css — the same plumbing `Button` uses for its
 * hover reversal — so the sweep cross-fades rather than snapping.
 */

"use client";

import s from "./SegmentedToggle.module.css";

export interface SegmentedToggleProps {
  /** two views, or with `actions` two or more commands — see the notes above */
  options: readonly string[];
  selectedIndex?: number;
  onChange?: (index: number) => void;
  actions?: boolean;
  /** the group's accessible name, when `actions` is set */
  label?: string;
  /** per option, `actions` only: a command with nothing to act on yet */
  disabled?: readonly boolean[];
  className?: string;
}

export default function SegmentedToggle({
  options,
  selectedIndex = 0,
  onChange,
  actions,
  label,
  disabled,
  className,
}: SegmentedToggleProps) {
  return (
    <div
      className={[s.toggle, className].filter(Boolean).join(" ")}
      role={actions ? "group" : "tablist"}
      aria-label={label}
    >
      {options.map((option, i) => (
        <button
          key={option}
          type="button"
          role={actions ? undefined : "tab"}
          aria-selected={actions ? undefined : selectedIndex === i}
          className={`${s.segment} ${selectedIndex === i ? s.selected : ""} t-button-md`}
          disabled={actions ? disabled?.[i] : undefined}
          onClick={() => onChange?.(i)}
        >
          {/* the fixed rim light (globals.css `.edge-light`) — shown only where
              the indigo pill is, see SegmentedToggle.module.css */}
          <span className={`${s.edge} edge-light`} aria-hidden="true" />
          <span className={`${s.label} shine-text shine-on-hover`}>{option}</span>
        </button>
      ))}
    </div>
  );
}
