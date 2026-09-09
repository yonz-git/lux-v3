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
  options: [string, string];
  selectedIndex?: number;
  onChange?: (index: number) => void;
}

export default function SegmentedToggle({
  options,
  selectedIndex = 0,
  onChange,
}: SegmentedToggleProps) {
  return (
    <div className={s.toggle} role="tablist">
      {options.map((label, i) => (
        <button
          key={label}
          role="tab"
          aria-selected={selectedIndex === i}
          className={`${s.segment} ${selectedIndex === i ? s.selected : ""}`}
          onClick={() => onChange?.(i)}
        >
          <span className={s.label}>{label}</span>
        </button>
      ))}
    </div>
  );
}
