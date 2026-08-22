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
 */
export function Tag({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: "neutral" | "brand";
  className?: string;
}) {
  return (
    <span
      className={[styles.tag, "t-label-sm", className].filter(Boolean).join(" ")}
      data-variant={variant}
    >
      {children}
    </span>
  );
}
