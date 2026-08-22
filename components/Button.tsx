import type { ButtonHTMLAttributes } from "react";
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
 * ⚠️ `Style=Secondary, State=Hover` DOES NOT EXIST in the set. Secondary's
 * hover is the same 40% softening as Primary's, because that is the only hover
 * treatment the component has ever had — see Button.module.css.
 */
export function Button({
  children,
  variant = "primary",
  fullWidth,
  className,
  href,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  /** render as a link when the action is navigation, so it behaves like one */
  href?: string;
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
