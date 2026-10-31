"use client";

import { useId, type ReactNode } from "react";
import styles from "./QuestionPanel.module.css";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Orb } from "@/components/ui/Orb";

/**
 * One investigation question in its glass panel — lux-v3, 1 Oct 2026, from the
 * canvas boards ("First pages"). The panel is `.panel` (app/globals.css):
 * 30% frost, 28 radius, padded 32 / 24 / 24. The question is the panel's
 * `<h2>`, asked in LUX's own bubble beside the chat's orb, with an
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
      className={className ? `panel ${styles.panel} ${className}` : `panel ${styles.panel}`}
    >
      <div className={styles.head}>
        {/* ⚠️ THE QUESTION IS LUX'S BUBBLE, NOT A HEADING LINE — 29 Oct 2026,
            usability testing, asked for directly ("these should be in bubbles
            too"): step 1 already asks its question in the orb's bubble, and
            steps 2–4 read as a different voice. Same pair, centred. The
            `role="heading"` keeps the level the `<h2>` carried. */}
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
