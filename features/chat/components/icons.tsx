/**
 * The one glyph this screen needs that the design system does not have.
 *
 * ⚠️ IT LIVES HERE, NOT IN `components/ui/icons.tsx`, AND THAT IS THE RULE
 * RATHER THAN AN OMISSION. `components/ui/` is the layer underneath the
 * features; a glyph used by exactly one section is that section's, however
 * generic it looks. The thirteen icons in the DS set are the thirteen the
 * design system publishes — raise this one in Figma before promoting it.
 *
 * It is the Figma vector's own coordinates, exported from the frame and offset
 * into the icon box, not redrawn by eye:
 *   send  270:120 — the white arrow inside the composer's send disc
 *
 * ⚠️ `MoreVerticalIcon` LIVED HERE AND WAS DELETED WITH THE KEBAB IT DREW. It
 * had no other caller, and a glyph kept "in case" is how a feature-local icon
 * file turns into a second icon set.
 *
 * ⚠️ NO `width` / `height` ON IT, for the reason `components/ui/icons.tsx`
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
