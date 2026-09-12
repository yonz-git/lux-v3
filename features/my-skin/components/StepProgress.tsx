"use client";

import { useEffect } from "react";
import styles from "./StepProgress.module.css";
import { TOTAL_STEPS } from "@/features/my-skin/flow";

/**
 * Where the track was the last time it painted, so the next mount knows what to
 * grow FROM.
 *
 * ⚠️ MODULE STATE, AND IT IS THE POINT RATHER THAN A SHORTCUT. Each step is its
 * own route, so nothing about the track survives the navigation — not the
 * element, not a ref, not component state. The MODULE does survive it, because
 * a client-side navigation never reloads the bundle, and one number is the
 * whole of what the entrance needs.
 *
 * ⚠️ IT IS WRITTEN ONLY FROM AN EFFECT, WHICH IS WHAT MAKES IT SAFE ON THE
 * SERVER. Module scope on a server is shared by every request in the process,
 * so a value written during render would be another visitor's. Effects do not
 * run on the server, so this is `null` there for the life of the process and
 * the fallback below is what prerenders — the same value the client's first
 * render computes, so hydration matches.
 *
 * ⚠️ THE FALLBACK IS `step - 1`, i.e. "you came from the step before this one".
 * That is the truth on a cold load of a deep link, where there is no previous
 * step and the bar growing from the one behind reads as the flow catching up.
 */
let lastPaintedStep: number | null = null;

/**
 * The step-progress track — Figma `progress` (4px tall, never 2 or 3).
 *
 * Track = border/subtle, fill = bg/brand, both fully rounded. The fill width is
 * step / TOTAL_STEPS, so the track can never drift out of sync with the flow
 * the way a hardcoded percentage would.
 *
 * It renders as a real progressbar rather than two divs, so assistive tech
 * announces position in the flow.
 *
 * ⚠️ IT NEEDS `aria-label` AS WELL AS `aria-valuetext`. `role="progressbar"`
 * takes its accessible NAME from a label, never from its value — so without
 * this the track announced "Step 2 of 5" with no indication of what was being
 * measured, and axe flagged it `aria-progressbar-name` (serious) on all five
 * flow screens. The name says what the bar is; `aria-valuetext` says where it
 * has got to.
 *
 * ⚠️ THE WIDTH GOES THROUGH `--progress` / `--progress-from` RATHER THAN
 * `style={{ width }}`, AND THAT IS THE WHOLE FIX FOR A TRANSITION THAT NEVER
 * RAN. An inline width is the element's only width at every moment of its life,
 * including the first — so the fill mounted at its destination and the module's
 * `transition: width` had nothing to animate (measured: `getAnimations()` empty
 * across a real step change). Two custom properties let `@starting-style` name
 * a different value for the mount frame, which is the one thing an inline style
 * cannot express. The reasoning is on `.fill` in StepProgress.module.css.
 *
 * ⚠️ GOING BACK SHRINKS THE BAR, WHICH IS WHY THE PREVIOUS STEP IS REMEMBERED
 * AT ALL. `step - 1` alone would have grown the fill from 20% up to 40% while
 * the user walked backwards from step 3 to step 2 — an animation saying the
 * opposite of what just happened, and worse than no animation.
 */
export function StepProgress({ step }: { step: number }) {
  const pct = (step / TOTAL_STEPS) * 100;
  const fromPct = ((lastPaintedStep ?? step - 1) / TOTAL_STEPS) * 100;

  useEffect(() => {
    lastPaintedStep = step;
  }, [step]);

  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label="Investigation progress"
      aria-valuemin={1}
      aria-valuemax={TOTAL_STEPS}
      aria-valuenow={step}
      aria-valuetext={`Step ${step} of ${TOTAL_STEPS}`}
    >
      <div
        className={styles.fill}
        style={
          {
            "--progress": `${pct}%`,
            "--progress-from": `${fromPct}%`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
