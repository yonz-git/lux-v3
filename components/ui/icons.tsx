/**
 * The lux-v3 icon set — VIDGEN'S GLYPHS, 1 Oct 2026.
 *
 * Every path below that has a VidGen counterpart is copied from
 * ~/Claude/vidgen/index.html or ~/Claude/vidgen-studio/index.html with its own
 * viewBox, so the drawing is the reference's and not a redraw by eye. The few
 * LUX needs that VidGen never draws (search, the success tick, the note pencil,
 * the four nav marks) are kept and drawn to the same weight.
 *
 * ⚠️ ONE STROKE AT EVERY SIZE. Each line uses `vectorEffect="non-scaling-stroke"`
 * at 1.4px, so a glyph drawn in a 13 box and one drawn in a 22 box come out the
 * same weight however large `--icon-size` makes them — the references draw
 * every glyph at 1.3–1.6 on screen, never scaled.
 *
 * ⚠️ NO `width` / `height` HERE. Size comes from `:where(svg[data-lux-icon])`
 * in globals.css; a glyph whose reference size is not `md` (24) sets
 * `--icon-default` inline — the size it is drawn at in VidGen — and a caller's
 * `--icon-size` or any class still overrides it (non-negotiable 14).
 */

import type { CSSProperties, ReactNode } from "react";

type IconProps = { className?: string };

const W = 1.4;

function Icon({
  box,
  size,
  className,
  fill,
  kind,
  children,
}: {
  box: string;
  /**
   * Which size family the glyph belongs to — `vidgen.css` scales by it:
   * `close` and `chevron` draw at 60% of their box, `glyph` at 85%, and an
   * unset kind (plus, minus, arrows, the nav set) at full size.
   */
  kind?: "close" | "chevron" | "glyph";
  /** the size VidGen draws it at; omitted = `--size-icon-md` (24) */
  size?: number;
  className?: string;
  fill?: boolean;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={box}
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? undefined : "currentColor"}
      strokeWidth={fill ? undefined : W}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      data-lux-icon={kind ?? ""}
      style={
        {
          display: "block",
          flex: "none",
          ...(size ? { "--icon-default": `${size}px` } : null),
        } as CSSProperties
      }
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* lines drawn at the set's weight whatever the box is scaled to */
const ns = { vectorEffect: "non-scaling-stroke" as const };

/* ---------------------------------------------------------------------------
   NAVIGATION AND DIRECTION
   --------------------------------------------------------------------------- */

/** The back button's arrow — VidGen Welcome `.back`. */
export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <Icon box="0 0 14 12" size={16} className={className}>
      <path d="M13 6H1.5M6 1.5 1.5 6 6 10.5" {...ns} />
    </Icon>
  );
}

/** The slide-to-start knob's arrow — VidGen Welcome `.knob`. */
export function ArrowRightIcon({ className }: IconProps) {
  return (
    <Icon box="0 0 14 12" size={16} className={className}>
      <path d="M1 6h11.5M8 1.5 12.5 6 8 10.5" {...ns} />
    </Icon>
  );
}

/** `>>` with the first step faded — the slider's "keep going". */
export function DoubleChevronIcon({ className }: IconProps) {
  return (
    <Icon kind="chevron" box="0 0 20 12" size={20} className={className}>
      <path d="M3 2l4 4-4 4" strokeOpacity={0.35} {...ns} />
      <path d="M12 2l4 4-4 4" {...ns} />
    </Icon>
  );
}

/* The chevrons are the Storyboard's `.nav` pair, extended to a down twin. */
export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <Icon kind="chevron" box="0 0 5 7" size={16} className={className}>
      <path d="M4 .8 1.2 3.5 4 6.2" {...ns} />
    </Icon>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <Icon kind="chevron" box="0 0 5 7" size={16} className={className}>
      <path d="M1 .8l2.8 2.7L1 6.2" {...ns} />
    </Icon>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Icon kind="chevron" box="0 0 7 5" size={16} className={className}>
      <path d="M.8 1l2.7 2.8L6.2 1" {...ns} />
    </Icon>
  );
}

/** The hamburger — VidGen Assistant. */
export function MenuIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 20 14" size={20} className={className}>
      <path d="M1.5 1.5h17M1.5 7h17M1.5 12.5h17" {...ns} />
    </Icon>
  );
}

/* ---------------------------------------------------------------------------
   ACTIONS
   --------------------------------------------------------------------------- */

export function PlusIcon({ className }: IconProps) {
  return (
    <Icon box="0 0 16 16" size={16} className={className}>
      <path d="M8 1.5v13M1.5 8h13" {...ns} />
    </Icon>
  );
}

/** The zoom control's minus — Storyboard `.zoom`. */
export function MinusIcon({ className }: IconProps) {
  return (
    <Icon box="0 0 16 16" size={16} className={className}>
      <path d="M1.5 8h13" {...ns} />
    </Icon>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Icon kind="close" box="0 0 13 13" size={14} className={className}>
      <path d="M1.5 1.5l10 10M11.5 1.5l-10 10" {...ns} />
    </Icon>
  );
}

/** The bell — VidGen Assistant's notifications button. */
export function BellIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 22 22" size={22} className={className}>
      <path d="M6 15.5V10a5 5 0 0 1 10 0v5.5l1.5 1.5h-13z" {...ns} />
      <path d="M9.3 19a1.9 1.9 0 0 0 3.4 0" {...ns} />
      <path d="M4 4.5 5.8 6M18 4.5 16.2 6" {...ns} />
    </Icon>
  );
}

/** The voice button — a mic with a spark. */
export function MicIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 20 20" size={20} className={className}>
      <rect x="6.5" y="3" width="5" height="9" rx="2.5" {...ns} />
      <path d="M3.5 9.5a5.5 5.5 0 0 0 11 0M9 15v3" {...ns} />
      <path d="M15.5 2v3M14 3.5h3" {...ns} />
    </Icon>
  );
}

/** The Storyboard image card's camera (`Regenerate`). */
export function CameraIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 18 18" size={20} className={className}>
      <rect x="2" y="5" width="14" height="11" rx="2" {...ns} />
      <path d="M6 5V3.5A1.5 1.5 0 0 1 7.5 2h3A1.5 1.5 0 0 1 12 3.5V5" {...ns} />
      <circle cx="9" cy="10.5" r="2.5" {...ns} />
    </Icon>
  );
}

/** The diagonal arrow the Storyboard labels `Edit` and `Description`. */
export function ExpandIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 18 18" size={18} className={className}>
      <path d="M2 2h10M2 2v10M6 6l10 10M10 16h6v-6" {...ns} />
    </Icon>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 18 18" size={18} className={className}>
      <path d="M2.5 4.5h13M7 4.5V2.5h4v2M4 4.5l1 11h8l1-11" {...ns} />
    </Icon>
  );
}

/** The four corner marks before the Storyboard's `Image` label. */
export function FrameIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 8 8" size={14} className={className}>
      <path d="M.5 2.3V.5h1.8M5.7.5h1.8v1.8M7.5 5.7v1.8H5.7M2.3 7.5H.5V5.7" {...ns} />
    </Icon>
  );
}

/**
 * A pencil, for the check-in's "Add a note". ⚠️ NOT A VIDGEN GLYPH — the
 * references have no pencil (`ExpandIcon` is what they label Edit, and a
 * diagonal arrow does not say "write"). Drawn to the set's weight.
 */
export function NoteIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 20 20" size={20} className={className}>
      <path d="M13.4 3.6a1.7 1.7 0 0 1 2.4 2.4l-8 8-3.2.8.8-3.2 8-8Z" {...ns} />
      <path d="M12.2 4.8l3 3" {...ns} />
    </Icon>
  );
}

/** ⚠️ NOT A VIDGEN GLYPH — the references have no search. */
export function SearchIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 24 24" size={20} className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" {...ns} />
      <path d="M15.5 15.5 20 20" {...ns} />
    </Icon>
  );
}

/* ---------------------------------------------------------------------------
   SPARKLES — the AI's mark
   --------------------------------------------------------------------------- */

/** The outline sparkle with a small cross — the `Prompt` label. */
export function SparkleIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 18 18" size={18} className={className}>
      <path d="M7 3.5c.5 2.8 1.7 4 4.5 4.5-2.8.5-4 1.7-4.5 4.5-.5-2.8-1.7-4-4.5-4.5 2.8-.5 4-1.7 4.5-4.5z" {...ns} />
      <path d="M14 1.5v3M12.5 3h3M13.5 12l1.5 1.5M15 12l-1.5 1.5" {...ns} />
    </Icon>
  );
}

/** The filled sparkles on the primary circle — `Generate`. */
export function GenerateIcon({ className }: IconProps) {
  return (
    <Icon box="0 0 22 22" size={22} className={className} fill>
      <path d="M9 4c.7 3.9 2.6 5.8 6.5 6.5-3.9.7-5.8 2.6-6.5 6.5-.7-3.9-2.6-5.8-6.5-6.5C6.4 9.8 8.3 7.9 9 4z" />
      <path d="M16.5 2c.3 1.6 1 2.3 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5z" />
      <circle cx="17.5" cy="16.5" r="1.3" />
    </Icon>
  );
}

/* ---------------------------------------------------------------------------
   CHIP GLYPHS — the prompt's option row
   --------------------------------------------------------------------------- */

/** A portrait frame — `9:16`. */
export function AspectIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 12 18" size={18} className={className}>
      <rect x="1" y="1" width="10" height="16" rx="2" {...ns} />
    </Icon>
  );
}

/** A four-point star — `1080p`. */
export function QualityIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 20 20" size={20} className={className}>
      <path d="M10 1.5c.8 4.6 3.9 7.7 8.5 8.5-4.6.8-7.7 3.9-8.5 8.5-.8-4.6-3.9-7.7-8.5-8.5 4.6-.8 7.7-3.9 8.5-8.5z" {...ns} />
    </Icon>
  );
}

/** A dial — `15s`. */
export function DurationIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 18 18" size={18} className={className}>
      <circle cx="9" cy="9" r="7.5" {...ns} />
      <path d="M12 6l-5 6" {...ns} />
    </Icon>
  );
}

/** Two sliders — `None` (style). */
export function SlidersIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 20 18" size={20} className={className}>
      <path d="M1 5h9M15 5h4M1 13h4M10 13h9" {...ns} />
      <circle cx="12.5" cy="5" r="2.5" {...ns} />
      <circle cx="7.5" cy="13" r="2.5" {...ns} />
    </Icon>
  );
}

/** Stacked sheets — `3v` (versions). */
export function VersionsIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 18 18" size={18} className={className}>
      <rect x="1" y="4" width="12" height="13" rx="1.5" {...ns} />
      <path d="M5 1h10.5A1.5 1.5 0 0 1 17 2.5V14" {...ns} />
    </Icon>
  );
}

/** A question in a circle — mobile `Help`. */
export function HelpIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 18 18" size={18} className={className}>
      <circle cx="9" cy="9" r="7.5" {...ns} />
      <path d="M7 7a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2v.5" {...ns} />
      <circle cx="9" cy="12.8" r=".4" fill="currentColor" {...ns} />
    </Icon>
  );
}

/** An `i` in a circle — the Storyboard's `Help`. */
export function InfoIcon({ className }: IconProps) {
  return (
    <Icon kind="glyph" box="0 0 18 18" size={18} className={className}>
      <circle cx="9" cy="9" r="7.5" {...ns} />
      <path d="M9 8v5" {...ns} />
      <circle cx="9" cy="5.3" r=".5" fill="currentColor" {...ns} />
    </Icon>
  );
}

/* ---------------------------------------------------------------------------
   LUX-ONLY GLYPHS — no VidGen counterpart, kept and re-weighted
   --------------------------------------------------------------------------- */

/** The success tick (product added). */
export function SuccessCheckIcon({ className }: IconProps) {
  return (
    <Icon box="0 0 28 28" size={28} className={className}>
      <path d="M5 13L10 18L20 6" {...ns} />
    </Icon>
  );
}

/** `Progress` — `SymptomTrend`'s line, with the latest reading marked. */
export function ProgressIcon({ className }: IconProps) {
  return (
    <Icon box="0 0 24 24" className={className}>
      <path d="M4 15.25L9 10.25L12.5 13.75L19.25 7" {...ns} />
      <circle cx="19.25" cy="7" r="1.6" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/** `Analysis` — two things asked whether they go together. */
export function CheckIcon({ className }: IconProps) {
  return (
    <Icon box="0 0 24 24" className={className}>
      <circle cx="9.25" cy="12" r="5.75" {...ns} />
      <circle cx="14.75" cy="12" r="5.75" {...ns} />
    </Icon>
  );
}

/**
 * `My skin` — traced from `features/my-skin/assets/face-silhouette.svg`, the
 * head only, cut at the jaw (see `scripts/face-art.mjs`). The ears are the
 * read at 20px; do not simplify them away.
 */
export function MySkinIcon({ className }: IconProps) {
  return (
    <Icon box="0 0 24 24" className={className}>
      <path
        d="M7.54 22.0L7.52 19.39 6.59 17.75 5.91 15.3 5.4 14.87 4.32 11.55 4.23 10.42 4.69 10.01 5.11 10.28 5.53 6.77 6.16 5.26 6.92 4.23 9.35 2.55 10.83 2.1 12.18 2.0 13.59 2.2 14.93 2.7 17.13 4.33 17.88 5.43 18.43 6.77 18.85 10.27 19.39 10.04 19.77 10.62 18.58 14.82 18.05 15.3 17.37 17.75 16.44 19.38 16.42 22.0Z"
        {...ns}
      />
    </Icon>
  );
}

/** `Products` — the serum bottle every product row draws. */
export function ProductsIcon({ className }: IconProps) {
  return (
    <Icon box="0 0 24 24" className={className}>
      <path d="M10.25 3.25h3.5v3.1c0 .5.21.98.58 1.31l1.42 1.28c.53.48.83 1.15.83 1.86v8.45a2 2 0 0 1-2 2h-5.16a2 2 0 0 1-2-2V10.8c0-.71.3-1.38.83-1.86l1.42-1.28c.37-.33.58-.81.58-1.31V3.25Z" {...ns} />
      <path d="M8.25 13.75h7.5" {...ns} />
    </Icon>
  );
}
