"use client";

import { useId, type ReactNode } from "react";
import styles from "./QuestionPanel.module.css";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Orb } from "@/components/ui/Orb";

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
        <div className={styles.ask}>
          <span className={styles.orb} aria-hidden="true">
            {/* the chat's orb, as step 1's coach wears it */}
            <Orb size="40px" animateIn halo />
          </span>
          <ChatBubble from="ai" hug className={styles.bubble}>
            <span id={id} role="heading" aria-level={2} className="t-body2-body1">
              {question}
            </span>
          </ChatBubble>
        </div>
        {hint && <p className={`${styles.hint} t-body3`}>{hint}</p>}
      </div>
      {children}
    </section>
  );
}
