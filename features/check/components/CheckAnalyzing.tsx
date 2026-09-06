"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./CheckAnalyzing.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { Orb } from "@/components/ui/Orb";
import { PassList, passesDuration } from "@/components/ui/PassList";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { CHECK_PASSES, ingredientCount } from "@/features/check/check";
import { toIso } from "@/lib/date";

/** How long the analysis takes — the length of the pass list, so the screen
 *  cannot leave before it has finished ticking or hang after it has. */
const ANALYSIS_MS = passesDuration(CHECK_PASSES.length);

/**
 * `Check — analyzing` (605:2163) at `/check/analyzing`.
 *
 * ⚠️ KEPT AS ITS OWN ROUTE, unlike `Product added` which the PRODUCTS remap
 * deleted. That screen existed to ANNOUNCE a navigation; this one covers a
 * WAIT. It is also the section's brand moment — cloned from `05 — Investigating`
 * per the handoff, the orb visibly doing the work — and a compatibility result
 * that appeared instantly would read as a lookup rather than an analysis.
 *
 * ⚠️ THE PROGRESS BAR IS GONE, REPLACED BY A NAMED PASS LIST — decided 6 Sep
 * 2026, after the same list shipped on the investigation's analysis and read
 * better. `Check — analyzing` (605:2163) draws an 8px `analysis-bar` and the
 * handoff calls out its height (8, not the 4px `size/progress-track`, so it is
 * not mistaken for the investigation's step track). All of that is now moot:
 * a bar says only that something is happening, while the list says WHAT is
 * being compared, which is the same argument the product brief makes for the
 * other screen. ⚠️ NOT IN FIGMA — on the catch-up list.
 *
 * ⚠️ FIVE PASSES HERE, SIX ON THE INVESTIGATION'S. They share the component,
 * not the content: CHECK has no timeline and no tolerated set, so it must not
 * claim those passes. See `CHECK_PASSES` in `check.ts`.
 *
 * On completion it saves the check and replaces itself in history, so `back`
 * from the results goes to `/check`, never to a spinner that would immediately
 * run again.
 */
export function CheckAnalyzing() {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();

  const basket = answers.checkBasket ?? [];

  /* biome-ignore lint/correctness/useExhaustiveDependencies: THIS RUNS ONCE, ON
     PURPOSE — it is a fixed-length wait that ends in a route change, not a
     subscription to its inputs. `basket` is a new array every render, so listing
     it (or `setAnswer`, which the provider rebuilds) would clear and restart the
     timer on each one and the screen would never leave. The empty deps are the
     behaviour. */
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
          LUX is analysing…
        </h1>

        <PassList
          className={styles.passes}
          passes={CHECK_PASSES}
          label="Analysing your products"
        />

        <p className={`${styles.description} t-body3`}>
          Analysing {basket.length}{" "}
          {basket.length === 1 ? "product" : "products"} and{" "}
          {ingredientCount(basket)} ingredients against your skin profile
        </p>
      </div>
    </HubScreen>
  );
}
