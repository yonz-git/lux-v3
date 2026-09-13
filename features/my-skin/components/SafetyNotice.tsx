"use client";

import { useEffect, useId, useState } from "react";
import styles from "./SafetyNotice.module.css";
import { SAFETY_NOTICE } from "@/features/my-skin/safety";

/**
 * The safety notice on step 1 — shown when a reported symptom is one LUX
 * should hand back to a person. `features/my-skin/safety.ts` owns the rule,
 * the trigger set and the copy, and the reasoning for all three.
 *
 * ⚠️ NOT IN FIGMA. No frame draws a conditional notice on 01 (476:2542 /
 * 476:2670). Rather than invent a treatment, this reuses the recipe of the
 * DISCLAIMER CARD that frame already had — a frosted System A card, `t-overline`
 * label over body copy, radius/lg, hairline `border/subtle` — which shipped on
 * this screen until `f3edc75` cut it while merging 01 and 03b. Its orphaned
 * `prefers-reduced-transparency` rule was still sitting in
 * `StartInvestigation.module.css` with nothing to match. So the block is the
 * comp's, and only the copy and the condition are decided here. Logged in
 * `docs/figma-catchup.md`; a real callout variant with an accent is the thing
 * to raise in Figma.
 *
 * ⚠️ THE WRAPPER IS ALWAYS RENDERED AND THE NOTICE IS NOT. A live region has to
 * be in the DOM BEFORE its contents change or screen readers announce nothing —
 * mounting the whole thing on the tick would make this silent for exactly the
 * users least able to see it appear.
 *
 * That same split is what lets the block OPEN and CLOSE rather than appear and
 * vanish. The wrapper persists, so it can hold a `grid-template-rows`
 * transition driven by `data-open` — no `@starting-style`. The card is held
 * mounted until the close transition ends (see `present` below). `.clip` is
 * the middle layer the grid row actually measures. See the module for why the
 * three levels are all load-bearing.
 *
 * ⚠️ IT ADDS HEIGHT TO A SCREEN THAT ALREADY OVERFLOWS. Step 1 is one of the two
 * screens where `Continue` sits behind the nav pill at rest (measured 440:
 * cta=852 against nav=858 — a known-open item in AGENTS.md). The notice pushes
 * that further whenever it fires. Taken deliberately: this is the one block on
 * the screen worth scrolling to, and the fix for the overflow is the docked
 * action bar that decision is already waiting on, not a shorter safety message.
 */
export function SafetyNotice({ show }: { show: boolean }) {
  const labelId = useId();

  /* ⚠️ THE CARD STAYS MOUNTED UNTIL IT HAS CLOSED — changed 13 Sep 2026, asked
     for directly ("when swelling and rash are unselected … make it smooth").
     It used to unmount the instant the last trigger was unticked, so the space
     shut in one frame and the face diagram jumped ~130px up. `present` holds
     the card for the length of the close; `show` alone drives `data-open`,
     which is what the transition reads. Set during render rather than in an
     effect, so opening never waits a frame. */
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
            <p className={`${styles.body} t-body3-body2`}>
              {SAFETY_NOTICE.body}
            </p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
