"use client";

import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import Link from "next/link";
import styles from "./SmallButton.module.css";

type Props = {
  label: string;
  /** `primary` is the flat indigo pill — a small action that commits, such as
   *  step 1's `Save` (canvas boards, 1 Oct 2026). Glass by default. */
  variant?: "glass" | "primary";
  arrow?: boolean;
  /** a leading glyph from `icons.tsx`, sized to icon/sm (20) by the module */
  icon?: ReactNode;
  /** accepted for existing callers; draws nothing in lux-v3 */
  specular?: boolean;
  href?: string;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

/**
 * Small Button — VidGen's glass pill at control height (36): the Storyboard's
 * time pill (`00:00`) and the chips' material, holding a worded action such as
 * `Save & exit` or `Update photo`. Label `t-button-sm` (14 Medium) in the
 * app's ink; a leading icon takes the brand indigo, the way every VidGen glyph
 * on glass does. The trailing arrow is part of the component; `arrow={false}`
 * hides it.
 *
 * `specular` is still accepted so existing callers compile; VidGen has no
 * pointer-tracking rim and nothing is drawn for it.
 */
export function SmallButton({
  label,
  variant = "glass",
  arrow = true,
  icon,
  specular: _specular,
  href,
  className,
  ...rest
}: Props) {
  const content = (
    <>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="t-button-sm">{label}</span>
      {arrow && (
        <span className="t-button-sm" aria-hidden="true">
          →
        </span>
      )}
    </>
  );
  const cls = [
    styles.button,
    variant === "primary" && styles.primary,
    "pressable",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // a disabled control must not stay a link — links are not disableable
  if (href && !rest.disabled) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {content}
    </button>
  );
}
