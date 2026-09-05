"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Analyzing.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { Orb } from "@/components/ui/Orb";
import { SuccessCheckIcon } from "@/components/ui/icons";
import { useInvestigation } from "@/lib/store/InvestigationProvider";

/**
 * The six passes, in the brief's own words — § 06, verbatim.
 *
 * ⚠️ THEY ARE NOT DECORATION AND THEY ARE NOT INVENTED. Each line names a pass
 * `features/my-skin/analysis.ts` actually runs, in the order it runs them:
 * `deriveEvidence` (1), `subtract` (2 and 3), `pairs` (4), the skin profile the
 * reasoning accordions read (5), and `hasReadableIngredients` (6). If a pass is
 * ever removed, its line goes with it — a progress screen that narrates work
 * the app is not doing is the exact thing the brief means by
 * "do not imply laboratory-level certainty".
 */
const PASSES = [
  "Comparing when each product was introduced",
  "Finding ingredients shared by products associated with the reaction",
  "Checking those ingredients against longer-tolerated products",
  "Checking for potentially irritating combinations used in the same period",
  "Considering your recorded skin type, tendencies, symptoms and timing",
  "Checking ingredient-data limitations and formula uncertainty",
] as const;

/** How long each pass is shown. Long enough to read one line, and six of them
 *  still under four seconds. */
const PASS_MS = 620;

/**
 * `/investigation/analyzing` — product brief § 06, "Analysis in progress".
 *
 * ⚠️ NOT IN FIGMA. Listed in `docs/figma-catchup.md`.
 *
 * ⚠️ IT NAMES THE PASSES RATHER THAN FILLING A BAR, WHICH IS WHY IT IS NOT A
 * COPY OF `CheckAnalyzing`. The brief asks for "a transparent progress state
 * with short, non-technical steps" and then lists all six. A bar says only that
 * something is happening; the point of this screen is that the user can see
 * WHAT is being compared before they are asked to believe the conclusion — the
 * same reason the findings screen leads with reasoning rather than a verdict.
 *
 * ⚠️ THE ORB IS THE MARK DOING THE WORK, not a spinner — `Orb thinking`, the
 * same call `CheckAnalyzing` makes. See `.orb-think-*` in `globals.css`.
 *
 * ⚠️ ONE `role="progressbar"`, NOT SIX LIVE REGIONS. Announcing each pass as it
 * arrives would read six sentences at a screen-reader user in under four
 * seconds. The progressbar carries the name and `aria-valuetext` says where it
 * has got to, which is exactly the split AGENTS.md describes — a progressbar
 * takes its name from a label and never from its value.
 */
export function Analyzing() {
  const router = useRouter();
  const { answers } = useInvestigation();
  const [pass, setPass] = useState(0);

  const products = answers.products ?? [];

  /* biome-ignore lint/correctness/useExhaustiveDependencies: THIS RUNS ONCE, ON
     PURPOSE — a fixed-length sequence that ends in a route change, not a
     subscription to its inputs. `products` is a new array every render, so
     listing it would restart the sequence on each one and the screen would
     never leave. Same call `CheckAnalyzing` makes and for the same reason. */
  useEffect(() => {
    if (products.length === 0) {
      router.replace("/investigation/evidence");
      return;
    }

    const timers = PASSES.map((_, i) =>
      setTimeout(() => setPass(i + 1), PASS_MS * (i + 1))
    );
    const done = setTimeout(
      () => router.replace("/investigation/findings"),
      PASS_MS * PASSES.length + 350
    );

    return () => {
      for (const t of timers) clearTimeout(t);
      clearTimeout(done);
    };
  }, []);

  const current = Math.min(pass, PASSES.length - 1);

  return (
    <HubScreen
      nav="my-skin"
      backHref="/investigation/evidence"
      layout="plain"
      center
      tightTop
    >
      <div className={styles.hero}>
        <Orb className="reveal-hero" thinking />

        <h1 className={`${styles.title} t-h4`}>LUX is comparing your timeline…</h1>

        <ol
          className={styles.passes}
          role="progressbar"
          aria-label="Analysing your investigation"
          aria-valuemin={0}
          aria-valuemax={PASSES.length}
          aria-valuenow={pass}
          aria-valuetext={PASSES[current]}
        >
          {PASSES.map((line, i) => (
            <li
              key={line}
              className={styles.pass}
              data-state={i < pass ? "done" : i === pass ? "active" : "waiting"}
            >
              <span className={styles.mark} aria-hidden="true">
                {i < pass ? <SuccessCheckIcon className={styles.tick} /> : null}
              </span>
              <span className="t-body3">{line}</span>
            </li>
          ))}
        </ol>

        {/* ⚠️ THE DISCLAIMER IS ON THE WAIT SCREEN, NOT ONLY ON THE RESULT.
            "Do not imply laboratory-level certainty" (§ 06) is about THIS
            screen — a progress list narrating six comparisons is the most
            authoritative-looking thing in the app, and it is reading four
            coarse duration buckets and an ingredient list of unknown
            concentration. Saying so here costs nothing and sets up the hedging
            on the findings screen. */}
        <p className={`${styles.caveat} t-caption`}>
          This compares what you recorded. It is not a test, and it cannot see
          concentration or formulation.
        </p>
      </div>
    </HubScreen>
  );
}
