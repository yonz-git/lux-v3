"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import styles from "./Button.module.css";

/**
 * Button — the labelled pill, in VidGen's two materials (1 Oct 2026).
 *
 *   primary    the brand gradient at 160°, white label, the brand shadow with
 *              a white rim along the top — VidGen's knob and generate circle
 *              stretched into a pill
 *   secondary  glass: white at 50%, a 1px glass edge, the inset rim — the
 *              chips' and round buttons' material
 *
 * `size="lg"` (default) is 56 tall, the height of every VidGen control;
 * `size="md"` is 48 for denser rows. A caller can still set `--button-height`.
 * The label is `t-button` (15 Medium) / `t-button-md` (14 Medium) — VidGen's
 * `Start` is 14.3 Medium, and the full-size pill takes one step more so a
 * flow's `Continue` still leads its screen.
 *
 * The references draw no labelled full-width button: the primary is the circle
 * and the slide-to-start. A flow step needs a worded `Continue`, so this is
 * the pill those two would make, from their own recipes. Round buttons are
 * `IconButton`.
 */
export function Button({
  children,
  variant = "primary",
  size = "lg",
  fullWidth,
  className,
  href,
  icon,
  onPointerMove,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  size?: "lg" | "md";
  fullWidth?: boolean;
  /** render as a link when the action is navigation, so it behaves like one */
  href?: string;
  /** optional leading glyph from `icons.tsx` */
  icon?: ReactNode;
}) {
  const cls = [
    styles.button,
    variant === "secondary" && styles.secondary,
    size === "md" && styles.md,
    fullWidth && styles.full,
    size === "md" ? "t-button-md" : "t-button",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  /* ⚠️ v2's HOVER ON THE INDIGO BUTTON, BACK 1 Oct 2026 — asked for directly
     ("apply the button hover effect we had before on the indigo buttons").
     Over the gradient's end-for-end reversal: a 1px edge light
     (globals.css `.edge-light`), the specular rim, and a band of light
     sweeping across the label (`.shine-on-hover`). Primary only; the glass
     secondary keeps its plain hover.
     ⚠️ THE RIM ORBITS ON ITS OWN NOW — asked for directly 1 Oct 2026 ("make
     it go around slowly automatically just by hovering"). It followed the
     pointer through `trackSpecular`; it now circles the pill once every 4.5s
     for as long as the pointer rests on it (app/vidgen.css). */
  const primary = variant === "primary";
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    onPointerMove?.(e as React.PointerEvent<HTMLButtonElement>);
  };

  const content = (
    <>
      {primary && (
        <>
          <span className="edge-light" aria-hidden="true" />
          <span className="specular" aria-hidden="true" />
        </>
      )}
      {icon}
      <span
        className={primary ? `${styles.label} shine-text shine-on-hover` : styles.label}
      >
        {children}
      </span>
    </>
  );

  /* a disabled control must not stay a link — `disabled` on an <a> does
     nothing, so it would stay focusable and still navigate */
  if (href && !rest.disabled) {
    return (
      <Link href={href} className={cls} style={rest.style} onPointerMove={handlePointerMove}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} onPointerMove={handlePointerMove} {...rest}>
      {content}
    </button>
  );
}
