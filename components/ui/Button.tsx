"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import styles from "./Button.module.css";
import { trackSpecular } from "./specular";

/**
 * Button — Figma component set 37:23.
 *
 * The label is Regular at every size — buttons in LUX are never Medium — and
 * steps down with the height: `size="lg"` (the default) is 62 tall with
 * `t-button` (17/22), `size="md"` is 48 tall with `t-button-md` (15/22, which is
 * the `Button` text style as Figma defines it). ⚠️ `md` IS NOT IN FIGMA, added
 * 13 Sep 2026: six screens hand-built a 48 pill and kept the 17px label, so the
 * shorter button read as the louder one. See Button.module.css `.md`.
 *
 * Primary and Secondary are implemented. Ghost is defined in Figma but no built
 * screen uses one, and its Hover variant still references `bg/accent-mint`, a
 * variable no longer in `02 Color` — resolve that in Figma before adding it
 * here rather than faking the variant.
 *
 * ⚠️ HOVER REVERSES THE GRADIENT; DISABLED IS THE 0.4 FADE. Settled 22 Aug
 * 2026 — the fade used to be the hover and it read as "unavailable", so the two
 * traded places. There is no prop for it: this is simply what a LUX button does.
 *
 * ⚠️ `Style=Secondary, State=Hover` still does not exist in the set, and
 * Secondary has no gradient to reverse — see Button.module.css.
 *
 * ⚠️ `icon` IS A PROTOTYPE-ONLY ADDITION, NOT YET A FIGMA VARIANT. The 37:23
 * set has no icon+label cell. Used by `03b — Location`'s "Take a photo" so it
 * does not have to hand-build the gradient/shadow recipe (non-negotiable #6)
 * just to add a leading glyph. Rendered as a plain sibling of the label, so it
 * picks up the button's own `gap` rather than a bespoke one.
 *
 * ⚠️ THREE HOVER-AND-ENTRANCE TREATMENTS ARE PROTOTYPE-ONLY TOO, ADDED 12 Sep
 * 2026 AND NOT IN FIGMA — all after reactbits references, all recorded in
 * globals.css beside their rules:
 *   - the label SHINES on hover (`.shine-on-hover`);
 *   - the rim carries a SPECULAR streak facing the pointer (`.specular`, the
 *     `<span>` below; `specular.ts` writes the angle — which is why this file
 *     is a client component now);
 *   - `beacon` makes the gradient breathe and sweeps a band of light across
 *     the pill every 10s. It is for ONE button, Welcome's `Create skin
 *     profile`, to say "start here"; a second caller is a product decision.
 */
export function Button({
  children,
  variant = "primary",
  size = "lg",
  fullWidth,
  className,
  href,
  icon,
  beacon,
  onPointerMove,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  /** `md` is 48 tall with a 15px label — see the doc comment above */
  size?: "lg" | "md";
  fullWidth?: boolean;
  /** render as a link when the action is navigation, so it behaves like one */
  href?: string;
  /** optional leading glyph — see the doc comment above */
  icon?: ReactNode;
  /** the breathing gradient + light sweep — Welcome's CTA only, see above */
  beacon?: boolean;
}) {
  const cls = [
    styles.button,
    variant === "secondary" && styles.secondary,
    size === "md" && styles.md,
    fullWidth && styles.full,
    beacon && `${styles.beacon} button-beacon`,
    size === "md" ? "t-button-md" : "t-button",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  /* the specular rim turns to face the pointer; a caller's own handler still
     runs */
  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    trackSpecular(e);
    onPointerMove?.(e);
  };
  const specular = <span className="specular" aria-hidden="true" />;

  /* The label is its own element so hover can treat it independently of the
     pill: ⚠️ NOT IN FIGMA — as of 12 Sep 2026 the label takes the shine
     (`.shine-on-hover`, globals.css), a band of light sweeping across the
     words while the gradient beneath reverses. Every Button in the app passes
     plain text as its only child, so this does not disturb the 8px gap the
     button reserves for a future icon + label. */
  const label = (
    <span className={`${styles.label} shine-text shine-on-hover`}>{children}</span>
  );

  /* ⚠️ A DISABLED CONTROL MUST NOT STAY A LINK. Links are not disableable —
     `disabled` on an <a> does nothing, so a disabled Button with an href would
     stay focusable and still navigate. Fall back to a real <button>, which is
     what SmallButton already does. */
  if (href && !rest.disabled) {
    return (
      <Link
        href={href}
        className={cls}
        style={rest.style}
        onPointerMove={handlePointerMove as unknown as React.PointerEventHandler<HTMLAnchorElement>}
      >
        {specular}
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} onPointerMove={handlePointerMove} {...rest}>
      {specular}
      {icon}
      {label}
    </button>
  );
}
