"use client";

import { useId, type ReactNode } from "react";
import styles from "./QuestionPanel.module.css";
import { CoachBubble } from "@/components/ui/CoachBubble";

export function QuestionPanel({
  question,
  hint,
  className,
  children,
}: {
  question: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();

  return (
    <section
      aria-labelledby={id}
      className={className ? `panel ${styles.panel} ${className}` : `panel ${styles.panel}`}
    >
      <div className={styles.head}>
        <CoachBubble>
          <span id={id} role="heading" aria-level={2} className="t-body2-body1">
            {question}
          </span>
        </CoachBubble>
        {hint && <p className={`${styles.hint} t-body3`}>{hint}</p>}
      </div>
      {children}
    </section>
  );
}
