"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import styles from "./Button.module.css";

export function Button({
  children,
  variant = "primary",
  size = "lg",
  fullWidth,
  width = fullWidth ? "full" : "hug",
  className,
  href,
  icon,
  onPointerMove,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  size?: "lg" | "md" | "sm";
  /** @deprecated — `width="full"` */
  fullWidth?: boolean;
  width?: "hug" | "full" | "action";
  /** render as a link when the action is navigation, so it behaves like one */
  href?: string;
  /** optional leading glyph from `icons.tsx` */
  icon?: ReactNode;
}) {
  const cls = [
    styles.button,
    variant === "secondary" && styles.secondary,
    size !== "lg" && styles[size],
    width === "full" && styles.full,
    width === "action" && styles.action,
    size === "lg" ? "t-button" : "t-button-md",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const primary = variant === "primary";
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    onPointerMove?.(e as React.PointerEvent<HTMLButtonElement>);
  };

  const content = (
    <>
      {primary && (
        <>
          <span className="edge-light" aria-hidden="true" />
          {/* its 120ms linear angle follows the pointer between moves; an
              eased 0.3s would trail the cursor, so the motion check skips it */}
          <span
            className="specular"
            aria-hidden="true"
            data-motion-exempt="pointer-follow smoothing, not a state change"
          />
        </>
      )}
      {icon}
      <span
        className={primary ? `${styles.label} shine-text shine-on-hover` : styles.label}
        data-align-exempt="centred on the x-height, not the caps (Button.module.css)"
      >
        {children}
      </span>
    </>
  );

  /* a disabled control must not stay a link — `disabled` on an <a> does
     nothing, so it would stay focusable and still navigate */
  if (href && !rest.disabled) {
    return (
      <Link
        href={href}
        className={cls}
        style={rest.style}
        onPointerMove={handlePointerMove}
        // the check measures a link's own text as well as the label inside it
        data-align-exempt="label centred on the x-height, not the caps (Button.module.css)"
      >
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
