"use client";

import { useId, type ReactNode } from "react";
import styles from "./QuestionPanel.module.css";
import { SparkleIcon } from "@/components/ui/icons";

/**
 * One investigation question in its glass panel — lux-v3, 1 Oct 2026, from the
 * canvas boards ("First pages"). The panel is `.vg-panel` (app/vidgen.css):
 * 30% frost, 28 radius, padded 32 / 24 / 24. The question is the panel's
 * `<h2>`, led by the sparkle the chat uses for LUX's own voice, with an
 * optional hint under it; the answers follow 20 below.
 *
 * ⚠️ AN `<h2>`: the step's title is the page's one `<h1>` (`QuestionScreen`),
 * and each question is a level down. The panel is a `<section>` named by it.
 */
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
      className={className ? `vg-panel ${styles.panel} ${className}` : `vg-panel ${styles.panel}`}
    >
      <div className={styles.head}>
        <h2 id={id} className={`${styles.question} t-h5`}>
          <SparkleIcon className={styles.sparkle} />
          {question}
        </h2>
        {hint && <p className={`${styles.hint} t-body3`}>{hint}</p>}
      </div>
      {children}
    </section>
  );
}
