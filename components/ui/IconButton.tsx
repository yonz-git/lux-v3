import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import Link from "next/link";
import styles from "./IconButton.module.css";

export function IconButton({
  label,
  children,
  variant = "glass",
  size = "lg",
  href,
  className,
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  children: ReactNode;
  variant?: "glass" | "ring" | "primary" | "outline" | "soft" | "plain";
  size?: "lg" | "md" | "sm" | "xs";
  href?: string;
  /** React 19 passes `ref` as a prop; it lands on the <button> */
  ref?: Ref<HTMLButtonElement>;
}) {
  const cls = [
    styles.button,
    /* `ring` is the glass disc that clears when pressed, for a filled glyph */
    variant === "ring" ? `${styles.glass} ${styles.ring}` : styles[variant],
    size === "md" && styles.md,
    size === "sm" && styles.sm,
    size === "xs" && styles.xs,
    /* the small discs keep a 44 hit area round them */
    size !== "lg" && "tap-target",
    "pressable",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href && !rest.disabled) {
    return (
      <Link href={href} className={cls} aria-label={label}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} aria-label={label} {...rest}>
      {children}
    </button>
  );
}
