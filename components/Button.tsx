import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import styles from "./Button.module.css";

/**
 * Button — Figma component set 37:23.
 *
 * The label style is `Button` (Regular 15/22). Buttons in LUX are deliberately
 * Regular weight, never Medium.
 *
 * Only Style=Primary is implemented, because that is all 00 Welcome needs.
 * Secondary and Ghost are defined in Figma — add them when a screen calls for
 * one, rather than faking a variant here.
 */
export function Button({
  children,
  fullWidth,
  className,
  href,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  /** render as a link when the action is navigation, so it behaves like one */
  href?: string;
}) {
  const cls = [styles.button, fullWidth && styles.full, "t-button", className]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
