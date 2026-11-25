"use client";

import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import Link from "next/link";
import styles from "./SmallButton.module.css";

type Props = {
  label: ReactNode;
  variant?: "glass" | "primary";
  size?: "md" | "sm";
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
 * Small Button — the glass pill at `--size-small-button` (44.8): the Storyboard's
 * time pill (`00:00`) and the chips' material, holding a worded action such as
 * `Save & exit` or `Update photo`. Label `t-button-sm` (14 Medium) in the
 * app's ink; a leading icon takes the brand indigo, the way every glyph
 * on glass does. The trailing arrow is part of the component; `arrow={false}`
 * hides it.
 *
 * `specular` is still accepted so existing callers compile; the reference has no
 * pointer-tracking rim and nothing is drawn for it.
 */
export function SmallButton({
  label,
  variant = "glass",
  size = "md",
  arrow = true,
  icon,
  specular: _specular,
  href,
  className,
  ...rest
}: Props) {
  const role = size === "sm" ? "t-label-sm" : "t-button-sm";
  const content = (
    <>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={role}>{label}</span>
      {arrow && (
        <span className={role} aria-hidden="true">
          →
        </span>
      )}
    </>
  );
  const cls = [
    styles.button,
    variant === "primary" && styles.primary,
    size === "sm" && styles.sm,
    "pressable",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  /* the md label centres on its x-height; the alignment check measures caps */
  const exempt =
    size === "sm"
      ? undefined
      : "label centred on the x-height, not the caps (SmallButton.module.css)";

  // a disabled control must not stay a link — links are not disableable
  if (href && !rest.disabled) {
    return (
      <Link href={href} className={cls} data-align-exempt={exempt}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} data-align-exempt={exempt} {...rest}>
      {content}
    </button>
  );
}
