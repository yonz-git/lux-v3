import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import styles from "./Button.module.css";

/**
 * Button — Figma component set 37:23.
 *
 * The label style is `Button` (Regular 15/22). Buttons in LUX are deliberately
 * Regular weight, never Medium.
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
 */
export function Button({
  children,
  variant = "primary",
  fullWidth,
  className,
  href,
  icon,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  /** render as a link when the action is navigation, so it behaves like one */
  href?: string;
  /** optional leading glyph — see the doc comment above */
  icon?: ReactNode;
}) {
  const cls = [
    styles.button,
    variant === "secondary" && styles.secondary,
    fullWidth && styles.full,
    "t-button",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  /* The label is its own element so it can be transformed independently of the
     pill — hover scales the label while the button itself holds still.
     Every Button in the app passes plain text as its only child, so this does
     not disturb the 8px gap the button reserves for a future icon + label. */
  const label = <span className={styles.label}>{children}</span>;

  /* ⚠️ A DISABLED CONTROL MUST NOT STAY A LINK. Links are not disableable —
     `disabled` on an <a> does nothing, so a disabled Button with an href would
     stay focusable and still navigate. Fall back to a real <button>, which is
     what SmallButton already does. */
  if (href && !rest.disabled) {
    return (
      <Link href={href} className={cls} style={rest.style}>
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} {...rest}>
      {icon}
      {label}
    </button>
  );
}
