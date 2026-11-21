import type { ElementType, ReactNode } from "react";
import styles from "./DataCard.module.css";

/**
 * The sage data card — SURFACE SYSTEM B, from `HANDOFF — INVESTIGATION &
 * PROGRESS` (559:1376).
 */
export function DataCard({
  as: Tag = "section",
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
} & Record<string, unknown>) {
  return (
    <Tag
      className={[styles.card, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}
