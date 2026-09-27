/**
 * Nav icons, exported from the Figma `Bottom-Nav-Bar` component (410:258).
 * The fill is `currentColor` so the nav controls colour and the active/inactive
 * treatment stays a pure opacity change, exactly as the component does it.
 */

import type { CSSProperties } from "react";

type IconProps = { className?: string };

/**
 * ⚠️ NO `width` / `height` HERE, AND THAT IS THE POINT. These used to be inline
 * `var(--size-icon-md)`, and an inline style beats any external stylesheet rule
 * at every specificity — so a module class asking for a different size was
 * silently ignored. Eleven rules across nine files were doing exactly that and
 * rendering 24 (including `ProductDetails`'s nested `icon-xs` chevron, whose
 * whole job is to be smaller than the header's), while three more had reached
 * for `!important` to get out of it.
 *
 * The size now comes from `svg[data-lux-icon]` in `globals.css`, wrapped in
 * `:where()` so it carries ZERO specificity and any single class beats it
 * without `!important`. An icon whose default is not `md` sets `--icon-size`.
 */
/* every glyph in the file is a stroked line drawing on `currentColor`; the two
   layout properties are all they share. ⚠️ `base` — the identical object the
   four FILLED nav marks used — went with them on 27 Sep 2026. */
const line = {
  display: "block" as const,
  flex: "none" as const,
};

/* ---------------------------------------------------------------------------
   THE FOUR NAV MARKS — redrawn as ONE SET, 27 Sep 2026, asked for directly
   ("can u find nice icons to add?").

   ⚠️ THIS IS THE REDRAW `AGENTS.md` HAS BEEN ASKING FOR. The bar went
   text-only on 13 Sep 2026 because the four glyphs it had were four different
   drawings: a ring of 12 filled dots, a filled circle inside a broken
   ring, a filled droplet and a solid bottle-and-drop. Four weights in one row
   read less finished than the words alone, and the standing note was "redraw
   them as ONE set before bringing icons back".

   The set: 24 box, 1.5 stroke on `currentColor`, round caps and joins, no
   fills except two deliberate dots (the mark on the skin, the reading on the
   trend) — the same recipe `ChevronLeftIcon`, `SearchIcon` and `CloseIcon`
   already use, so the nav's glyphs and the app's glyphs are finally one hand.
   They render at `--size-icon-sm` (20) in the bar; the box is 24 so they can
   take `md` anywhere else without redrawing.

   ⚠️ EACH ONE DRAWS ITS OWN SCREEN, NOT A GENERIC CATEGORY. The face with a
   mark is step 1's face diagram; the trend line is `SymptomTrend`'s chart; the
   two overlapping circles are what a compatibility check asks (do these two go
   together); the bottle is what `/products` lists. A magnifier would have done
   for three of them and said nothing about any.

   ⚠️ NOT IN FIGMA — the file still holds the old four. Raise the set there
   before treating these as canonical; see `docs/figma-catchup.md`.
   ⚠️ NOTHING ELSE IMPORTED THE OLD FOUR. `AGENTS.md` said they were kept "for
   their other callers (`PassList`)" — checked before replacing: `PassList`
   imports `SuccessCheckIcon`, and the four nav marks had no caller at all once
   the bar went text-only. That note is stale and has been corrected.
   --------------------------------------------------------------------------- */

/** `Progress` — `SymptomTrend`'s line, with the latest reading marked. */
export function ProgressIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-lux-icon style={line} className={className} aria-hidden="true">
      <path d="M4 15.25L9 10.25L12.5 13.75L19.25 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19.25" cy="7" r="1.6" fill="currentColor" />
    </svg>
  );
}

/**
 * `Analysis` — two things asked whether they go together. The overlap IS the
 * question, which is why it is two circles and not a magnifier.
 */
export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-lux-icon style={line} className={className} aria-hidden="true">
      <circle cx="9.25" cy="12" r="5.75" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14.75" cy="12" r="5.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * `My skin` — THE APP'S OWN FACE, not a drawing of one.
 *
 * ⚠️ IT IS TRACED FROM `features/my-skin/assets/face-silhouette.svg`, the
 * outline step 1's diagram already uses to mask its volume shading — asked for
 * directly 27 Sep 2026 ("take the outline of the face diagram we have and use
 * it as icon"), after three hand-drawn attempts failed in three different ways
 * (a front oval whose every interior mark became an eye or a mouth, the same
 * oval emptied until it read as a zero, then a profile). The nav item now
 * shows the same head the section opens on, which is the one thing a drawn
 * glyph could not do.
 *
 * ⚠️ HOW IT WAS DERIVED, SO IT CAN BE DERIVED AGAIN. The silhouette is a
 * 233-point polygon in a 670x1040 box covering head, neck AND shoulders. This
 * is the HEAD ONLY: the polygon was walked from its topmost point in both
 * directions and cut at y=812, just below the jaw, then reduced to 28 points
 * (Ramer-Douglas-Peucker, epsilon 6) and fitted into the 24 box with a 2
 * margin. Head-and-shoulders was rendered too and rejected — at 20px a bust is
 * the account avatar every app draws.
 * ⚠️ REGENERATE IT IF THE DIAGRAM IS RETRACED. `scripts/face-art.mjs` writes
 * the silhouette; this path is a copy and nothing keeps the two in step.
 *
 * ⚠️ THE EARS ARE THE READ. They are the two bulges at x=4.2 and x=19.8, and
 * they are what separates this from a rounded rectangle at 20px — the same
 * job the nose does in a profile. Do not simplify them away.
 */
export function MySkinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-lux-icon style={line} className={className} aria-hidden="true">
      <path
        d="M7.54 22.0L7.52 19.39 6.59 17.75 5.91 15.3 5.4 14.87 4.32 11.55 4.23 10.42 4.69 10.01 5.11 10.28 5.53 6.77 6.16 5.26 6.92 4.23 9.35 2.55 10.83 2.1 12.18 2.0 13.59 2.2 14.93 2.7 17.13 4.33 17.88 5.43 18.43 6.77 18.85 10.27 19.39 10.04 19.77 10.62 18.58 14.82 18.05 15.3 17.37 17.75 16.44 19.38 16.42 22.0Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** `Products` — the serum bottle every product row draws. */
export function ProductsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-lux-icon style={line} className={className} aria-hidden="true">
      <path d="M10.25 3.25h3.5v3.1c0 .5.21.98.58 1.31l1.42 1.28c.53.48.83 1.15.83 1.86v8.45a2 2 0 0 1-2 2h-5.16a2 2 0 0 1-2-2V10.8c0-.71.3-1.38.83-1.86l1.42-1.28c.37-.33.58-.81.58-1.31V3.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8.25 13.75h7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-lux-icon style={line} className={className} aria-hidden="true">
      <path d="M15 5L9 12L15 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" data-lux-icon style={{ ...line, "--icon-size": "var(--size-icon-sm)" } as CSSProperties} className={className} aria-hidden="true">
      <path d="M10 3.5V16.5M3.5 10H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A pencil, for `Check-in chat`'s "Add a note".
 *
 * ⚠️ NOT IN THE DESIGN SYSTEM. `Check-in chat` (555:1268) draws a pencil beside
 * "Add a note", and the file has no edit/pencil/write glyph anywhere — the only
 * icons that exist are the four nav marks, the chevrons, plus, camera, search,
 * close and the success tick. Drawn to match `CameraIcon`, which is its literal
 * neighbour on that screen: the same 20-box, the same 1.4 stroke on
 * currentColor, the same `--size-icon-sm`. Two glyphs sitting in a matched pair
 * of buttons must not be two different weights. **Raise it in Figma.**
 */
export function NoteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" data-lux-icon style={{ ...line, "--icon-size": "var(--size-icon-sm)" } as CSSProperties} className={className} aria-hidden="true">
      <path d="M13.4 3.6a1.7 1.7 0 0 1 2.4 2.4l-8 8-3.2.8.8-3.2 8-8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12.2 4.8l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" data-lux-icon style={{ ...line, "--icon-size": "var(--size-icon-sm)" } as CSSProperties} className={className} aria-hidden="true">
      <path d="M2.5 6.5A1.5 1.5 0 0 1 4 5h1.6a1 1 0 0 0 .83-.45l.64-.95A1 1 0 0 1 7.9 3.2h4.2a1 1 0 0 1 .83.4l.64.95a1 1 0 0 0 .83.45H16A1.5 1.5 0 0 1 17.5 6.5v8A1.5 1.5 0 0 1 16 16H4a1.5 1.5 0 0 1-1.5-1.5v-8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="10" cy="10.2" r="2.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-lux-icon style={line} className={className} aria-hidden="true">
      <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-lux-icon style={line} className={className} aria-hidden="true">
      <path d="M5 9L12 15L19 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* --------------------------------------------------------------------------
   PRODUCTS icons — `Icon / search` and `Icon / close` come out of the
   `Search Field` component (248:70); the tick is the glyph inside
   `Product added`'s check-circle (579:1540).

   Paths are the Figma vectors' own coordinates, offset into the icon box, not
   redrawn by eye.
   -------------------------------------------------------------------------- */

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-lux-icon style={line} className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 17L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-lux-icon style={line} className={className} aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The tick inside `Product added`'s 64px check-circle. 28px in Figma.
 *
 * ⚠️ The Figma vector carries BOTH a `feedback/success` fill and a
 * `text/primary` STROKE, and an open path renders as its stroke — so the tick
 * is dark, not green. That reads as a slip (the fill says what was meant), but
 * it is what the comp draws at both breakpoints, so it is what is drawn here.
 * Flagged rather than quietly corrected.
 */
export function SuccessCheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" data-lux-icon style={{ ...line, "--icon-size": "28px" } as CSSProperties} className={className} aria-hidden="true">
      <path d="M5 13L10 18L20 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
