import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import Link from "next/link";
import styles from "./IconButton.module.css";

/**
 * IconButton — VidGen's round control, the most-used control in both
 * references (1 Oct 2026). A 56 circle holding one glyph from `icons.tsx`.
 *
 *   glass    white @50% + glass edge + rim, brand-indigo glyph — `+`, mic,
 *            the Storyboard's tool rail
 *   primary  lux-v2's brand gradient + brand shadow, white glyph — `Generate`
 *   outline  no fill, a 1px ink hairline at 18% — Welcome's back arrow
 *   soft     `#eeecf5` lilac with a brand glyph — the Moodboard's `+`, for a
 *            round button on a WHITE card, where glass would not show
 *
 * `label` is REQUIRED and becomes the accessible name: a glyph alone says
 * nothing to a screen reader. `size="sm"` is 44, the HIG floor, for rows
 * where 56 is too much; 56 is the default because every VidGen circle is.
 *
 * ⚠️ TWO MORE SIZES, 31 Oct 2026 — asked for directly ("buttons that use the
 * same design should be using reusable components with variants"):
 *   md  48 — the back button (`ScreenHeader`, `HubScreen`)
 *   xs  20 — the small ✓ / ✎ / ✕ inside a field, a tray's corner ✕ and the
 *       chat panel's ✕. The disc is 20; `.tap-target` keeps the hit area at
 *       44 round it. Pair it with `CloseSmallIcon` (12) or a 16 glyph.
 * Every one of those was a copy of this circle in a screen's own module, and
 * a fix to one never reached the rest.
 */
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
  variant?: "glass" | "primary" | "outline" | "soft";
  size?: "lg" | "md" | "sm" | "xs";
  href?: string;
  /** React 19 passes `ref` as a prop; it lands on the <button> */
  ref?: Ref<HTMLButtonElement>;
}) {
  const cls = [
    styles.button,
    styles[variant],
    size === "sm" && styles.sm,
    size === "md" && styles.md,
    size === "xs" && styles.xs,
    size === "xs" && "tap-target",
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
