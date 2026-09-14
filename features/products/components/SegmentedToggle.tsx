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
 *
 * ⚠️ MORE THAN TWO OPTIONS, AND DISABLED SEGMENTS — `actions` ONLY, added 14
 * Sep 2026 for step 1's `Save` / `Reset` / `Reset all`, asked for directly as
 * "one button with three options". A tab list of three would need its own
 * arrow-key roving; a group of commands does not, so `options` widened only
 * for the case that is still just buttons. `disabled` marks a command with
 * nothing to act on yet: the segment fades to `opacity/disabled`, drops out of
 * the pointer-following pill, and the primary one gives up its indigo while it
 * cannot be pressed.
 */

"use client";

import s from "./SegmentedToggle.module.css";

export interface SegmentedToggleProps {
  /** two views, or with `actions` two or more commands — see the notes above */
  options: readonly string[];
  selectedIndex?: number;
  onChange?: (index: number) => void;
  /** two commands rather than two views — see the note above */
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
          className={`${s.segment} ${selectedIndex === i ? s.selected : ""}`}
          disabled={actions ? disabled?.[i] : undefined}
          onClick={() => onChange?.(i)}
        >
          {/* ⚠️ NOT IN FIGMA — the label shines on hover (globals.css
              `.shine-on-hover`), the same glint `SmallButton` has; a direct
              child of the button, which that rule requires */}
          {/* the fixed rim light (globals.css `.edge-light`) — shown only where
              the indigo pill is, see SegmentedToggle.module.css */}
          <span className={`${s.edge} edge-light`} aria-hidden="true" />
          <span className={`${s.label} shine-text shine-on-hover`}>{option}</span>
        </button>
      ))}
    </div>
  );
}
