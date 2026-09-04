/**
 * The two glyphs this screen needs that the design system does not have.
 *
 * ⚠️ THEY LIVE HERE, NOT IN `components/ui/icons.tsx`, AND THAT IS THE RULE
 * RATHER THAN AN OMISSION. `components/ui/` is the layer underneath the
 * features; a glyph used by exactly one section is that section's, however
 * generic it looks. The thirteen icons in the DS set are the thirteen the
 * design system publishes — raise these two in Figma before promoting them.
 *
 * Both are the Figma vectors' own coordinates, exported from the frame and
 * offset into the icon box, not redrawn by eye:
 *   more-vertical  270:102 — an 18px stroked kebab, three dots on one axis
 *   send           270:120 — the white arrow inside the composer's send disc
 *
 * ⚠️ NO `width` / `height` ON EITHER, for the reason `components/ui/icons.tsx`
 * records at length: an inline style beats every external stylesheet rule, so a
 * module class asking for a different size would be silently ignored. Size
 * comes from `:where(svg[data-lux-icon])` in globals.css, and a caller that
 * wants something other than `md` sets `--icon-size`.
 */

import type { CSSProperties } from "react";

type IconProps = { className?: string };

const base: CSSProperties = {
  display: "block",
  flex: "none",
};

/** `more-vertical` (270:102) — the chat's overflow menu affordance, 18 in the frame. */
export function MoreVerticalIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" data-lux-icon style={base} className={className} aria-hidden="true">
      <path
        d="M9 9.74993C9.41455 9.74993 9.7506 9.41417 9.7506 9C9.7506 8.58583 9.41455 8.25008 9 8.25008C8.58546 8.25008 8.2494 8.58583 8.2494 9C8.2494 9.41417 8.58546 9.74993 9 9.74993Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 4.50045C9.41455 4.50045 9.7506 4.1647 9.7506 3.75053C9.7506 3.33635 9.41455 3.0006 9 3.0006C8.58546 3.0006 8.2494 3.33635 8.2494 3.75053C8.2494 4.1647 8.58546 4.50045 9 4.50045Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 14.9994C9.41455 14.9994 9.7506 14.6636 9.7506 14.2495C9.7506 13.8353 9.41455 13.4996 9 13.4996C8.58546 13.4996 8.2494 13.8353 8.2494 14.2495C8.2494 14.6636 8.58546 14.9994 9 14.9994Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The send arrow (270:120), in the 52 box its disc occupies.
 *
 * ⚠️ THE 43° IS PART OF THE GLYPH, NOT A STYLE ON THE CALLER. The frame rotates
 * the whole `Send` node 43°, which is what turns a triangle drawn pointing
 * up-and-right into one pointing along the field — measured, the tip lands at
 * -1° from horizontal. The disc under it is a circle, so the rotation is
 * invisible on everything except this path. Baking it into the transform keeps
 * the glyph correct wherever it is used and keeps a magic angle out of the
 * stylesheet.
 *
 * The path is the export's own coordinates translated by the disc's origin in
 * that file (14, 8), so it sits in a 52 box rather than the 80 the shadow
 * needed. The disc itself is CSS — `gradient/brand` on a `radius/full` control
 * is the button recipe, not an image.
 */
export function SendArrowIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" data-lux-icon style={base} className={className} aria-hidden="true">
      <path d="M34 18L16 25.2L23.4 28.2L26.4 35.6L34 18Z" fill="currentColor" transform="rotate(43 26 26)" />
    </svg>
  );
}
