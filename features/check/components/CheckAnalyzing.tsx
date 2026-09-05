"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CheckAnalyzing.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { Orb } from "@/components/ui/Orb";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { ingredientCount } from "@/features/check/check";
import { toIso } from "@/lib/date";

/** How long the analysis takes. Long enough to read the copy, short enough not
 *  to be a tax on every check. */
const ANALYSIS_MS = 2600;

/**
 * `Check — analyzing` (605:2163) at `/check/analyzing`.
 *
 * ⚠️ KEPT AS ITS OWN ROUTE, unlike `Product added` which the PRODUCTS remap
 * deleted. That screen existed to ANNOUNCE a navigation; this one covers a
 * WAIT. It is also the section's brand moment — cloned from `05 — Investigating`
 * per the handoff, the orb visibly doing the work — and a compatibility result
 * that appeared instantly would read as a lookup rather than an analysis.
 *
 * ⚠️ THE BAR IS 8 TALL, DELIBERATELY NOT THE 4px `size/progress-track`. The
 * handoff calls this out: at 4 it would be mistaken for the investigation's
 * step track, which is exactly what CHECK is not.
 *
 * ⚠️ THE FILL IS A TRANSITION, NOT AN ANIMATION. A named `@keyframes` written
 * in a CSS Module compiles to a scoped name with no matching keyframes and
 * silently does nothing (AGENTS.md, motion). A width transition needs no name,
 * so it can live in the module: the bar mounts at 0 and is set to 100% on the
 * next frame.
 *
 * On completion it saves the check and replaces itself in history, so `back`
 * from the results goes to `/check`, never to a spinner that would immediately
 * run again.
 */
export function CheckAnalyzing() {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();
  const [running, setRunning] = useState(false);

  const basket = answers.checkBasket ?? [];

  useEffect(() => {
    // next frame, so the bar has rendered at 0 and the transition has something
    // to run from
    const raf = requestAnimationFrame(() => setRunning(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (basket.length === 0) {
      router.replace("/check/new");
      return;
    }

    const id = `check-${Date.now()}`;
    const timer = setTimeout(() => {
      setAnswer("checks", (prev) => [
        { id, date: toIso(new Date()), products: basket },
        ...(prev ?? []),
      ]);
      setAnswer("viewingCheck", id);
      router.replace("/check/results");
    }, ANALYSIS_MS);

    return () => clearTimeout(timer);
    // basket identity changes every render; its length and contents do not, and
    // re-running this would restart the timer forever
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HubScreen nav="check" backHref="/check/new" layout="plain" center tightTop>
      <div className={styles.hero}>
        {/* the orb IS the AI doing the work — the handoff's deviation #1 for
            05 — Investigating, which this screen was cloned from.

            ⚠️ `thinking` IS NOT IN FIGMA. The frame it was cloned from draws a
            STATIC orb, which on a wait screen puts all the motion in the
            progress bar and leaves the avatar sitting still — the bar then
            reads as the thing doing the work. The orb loops the mark's own
            L → U → X wave instead; see `.orb-think-*` in globals.css for why it
            is the mark rather than a spinner. */}
        <Orb className="reveal-hero" thinking />

        <h1 className={`${styles.title} t-h4`}>
          LUX is checking compatibility…
        </h1>

        <div
          className={styles.bar}
          role="progressbar"
          aria-label="Checking compatibility"
        >
          <span className={styles.fill} data-running={running || undefined} />
        </div>

        <p className={`${styles.description} t-body3`}>
          Analysing {basket.length}{" "}
          {basket.length === 1 ? "product" : "products"} and{" "}
          {ingredientCount(basket)} ingredients against your skin profile
        </p>
      </div>
    </HubScreen>
  );
}
