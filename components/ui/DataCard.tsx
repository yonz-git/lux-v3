import type { ElementType, ReactNode } from "react";
import styles from "./DataCard.module.css";

/**
 * The sage data card — SURFACE SYSTEM B, from `HANDOFF — INVESTIGATION &
 * PROGRESS` (559:1376).
 */
export function DataCard({
  as: Tag = "section",
  tone = "default",
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  /** the fill: every card's pale sage, or the face diagram's teal (the check-in calendar) */
  tone?: "default" | "calendar";
  className?: string;
  children?: ReactNode;
} & Record<string, unknown>) {
  return (
    <Tag
      className={[styles.card, tone === "calendar" && styles.calendar, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}
