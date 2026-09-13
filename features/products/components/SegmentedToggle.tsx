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
 *
 * ⚠️ `actions` RENDERS TWO ACTIONS, NOT TWO TABS — added 13 Sep 2026 when the
 * check-in record's `Save` / `Cancel` took this design, asked for directly. A
 * pair of commands is not a tab list: announced as tabs, `Cancel` would read as
 * a panel you could switch to. With `actions` the pill is a labelled `group`
 * of plain buttons and the "selected" segment is simply the primary one. The
 * look is identical, including the hover that moves the pill to the pointer.
 * ⚠️ The PRODUCTS tray's `Add product` / `Search again` is also two actions
 * and still renders as tabs — move it onto `actions` rather than copying this.
 */

"use client";

import s from "./SegmentedToggle.module.css";

export interface SegmentedToggleProps {
  options: [string, string];
  selectedIndex?: number;
  onChange?: (index: number) => void;
  /** two commands rather than two views — see the note above */
  actions?: boolean;
  /** the group's accessible name, when `actions` is set */
  label?: string;
  className?: string;
}

export default function SegmentedToggle({
  options,
  selectedIndex = 0,
  onChange,
  actions,
  label,
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
          className={`${s.segment} ${selectedIndex === i ? s.selected : ""}`}
          onClick={() => onChange?.(i)}
        >
          {/* ⚠️ NOT IN FIGMA — the label shines on hover (globals.css
              `.shine-on-hover`), the same glint `SmallButton` has; a direct
              child of the button, which that rule requires */}
          <span className={`${s.label} shine-text shine-on-hover`}>{option}</span>
        </button>
      ))}
    </div>
  );
}
