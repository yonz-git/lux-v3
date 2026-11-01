import styles from "./Tag.module.css";

/**
 * Tag — Figma component set 256:85. `Style=Neutral | Brand`.
 *
 * ⚠️ A TAG IS READ-ONLY BY CONTRACT. It is not a Chip: a Chip is a selectable
 * multi-select control with `role="checkbox"`, a Tag is a label. PRODUCTS uses
 * it for the duration badge on a saved product, the "92% match" score and the
 * "Added to: …" confirmation — none of which the user can click.
 *
 * Label style is `Label Small` (Medium 12/16), set on the component so every
 * instance inherits it.
 *
 * `size="sm"` takes the side padding 12 → 8 — CHECK's `Added`, beside
 * `SmallButton size="sm"`'s `Add` (1 Nov 2026, asked for directly: "the
 * pills are too big for this usage").
 */
export function Tag({
  children,
  variant = "neutral",
  size = "default",
  className,
  ...rest
}: {
  children: React.ReactNode;
  variant?: "neutral" | "brand";
  size?: "default" | "sm";
  className?: string;
} & React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      {...rest}
      className={[styles.tag, "t-label-sm", className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size === "sm" ? "sm" : undefined}
    >
      {children}
    </span>
  );
}
