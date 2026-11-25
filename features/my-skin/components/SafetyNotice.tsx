"use client";

import { useEffect, useId, useState } from "react";
import styles from "./SafetyNotice.module.css";
import { SAFETY_NOTICE } from "@/features/my-skin/safety";

/**
 * The safety notice on step 1 — shown when a reported symptom is one LUX
 * should hand back to a person. `features/my-skin/safety.ts` owns the rule,
 * the trigger set and the copy, and the reasoning for all three.
 */
export function SafetyNotice({ show }: { show: boolean }) {
  const labelId = useId();

  const [present, setPresent] = useState(show);
  if (show && !present) setPresent(true);

  /* the fallback for a close whose `transitionend` never arrives — a hidden
     tab freezes transitions (AGENTS.md, motion). Well past `duration/base`. */
  useEffect(() => {
    if (show || !present) return;
    const t = window.setTimeout(() => setPresent(false), 600);
    return () => window.clearTimeout(t);
  }, [show, present]);

  return (
    /* `polite`, not `assertive` — it must not cut across the announcement of
       the chip the user just pressed. */
    <div
      role="status"
      className={styles.live}
      data-open={show}
      onTransitionEnd={(e) => {
        if (
          !show &&
          e.target === e.currentTarget &&
          e.propertyName === "grid-template-rows"
        ) {
          setPresent(false);
        }
      }}
    >
      {present ? (
        <div className={styles.clip}>
          <section
            className={`${styles.notice} reveal-quick`}
            aria-labelledby={labelId}
          >
            <p id={labelId} className={`${styles.label} t-overline`}>
              {SAFETY_NOTICE.label}
            </p>
            <p className={`${styles.body} t-body2`}>
              {SAFETY_NOTICE.body}
            </p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
