import styles from "./Tag.module.css";

/** Tag — Figma component set 256:85. `Style=Neutral | Brand`, plus the soft
 *  `answer` (teal) and `symptom` (red) pills the skin profile uses. */
export function Tag({
  children,
  variant = "neutral",
  size = "default",
  className,
  ...rest
}: {
  children: React.ReactNode;
  variant?: "neutral" | "brand" | "answer" | "symptom";
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
