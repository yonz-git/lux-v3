"use client";

import { useEffect, useState } from "react";
import styles from "./AnalysisPasses.module.css";
import { Orb } from "@/components/ui/Orb";
import { SuccessCheckIcon } from "@/components/ui/icons";

/**
 * The six passes, in the brief's own words — § 06, verbatim.
 *
 * ⚠️ THEY ARE NOT DECORATION AND THEY ARE NOT INVENTED. Each line names a pass
 * `features/my-skin/analysis.ts` actually runs, in the order it runs them:
 * `deriveEvidence` (1), `subtract` (2 and 3), `pairs` (4), the skin profile the
 * reasoning reads (5), and `hasReadableIngredients` (6). If a pass is ever
 * removed, its line goes with it — a progress list narrating work the app is
 * not doing is exactly what the brief means by "do not imply laboratory-level
 * certainty".
 */
const PASSES = [
  "Comparing when each product was introduced",
  "Finding ingredients shared by the newer ones",
  "Checking those against what you already tolerate",
  "Checking for combinations used in the same period",
  "Considering your skin type and symptoms",
  "Checking what the ingredient data cannot tell us",
] as const;

/** How long each pass is shown. Six of them in under two and a half seconds. */
const PASS_MS = 380;

export const PASSES_TOTAL_MS = PASS_MS * PASSES.length + 300;

/**
 * § 06 — the analysis running.
 *
 * ⚠️ IT IS A STATE, NOT A ROUTE, AS OF 6 SEP 2026. It was
 * `/investigation/analyzing`, one of three screens between step 5 and an
 * answer; three routes for one question read as three more steps, which is
 * exactly the complaint. The wait is now the first two seconds of
 * `/investigation/analysis` and the app has one analysis screen.
 *
 * ⚠️ IT NAMES THE PASSES RATHER THAN FILLING A BAR. The brief asks for "a
 * transparent progress state with short, non-technical steps" and then lists
 * all six. A bar says only that something is happening; the point is that the
 * user can see WHAT is being compared before being asked to believe the
 * conclusion.
 *
 * ⚠️ ONE `role="progressbar"`, NOT SIX LIVE REGIONS. Announcing each pass as it
 * lands would read six sentences at a screen-reader user in two seconds. The
 * progressbar carries the name and `aria-valuetext` says where it has got to —
 * the split AGENTS.md describes.
 */
export function AnalysisPasses() {
  const [pass, setPass] = useState(0);

  useEffect(() => {
    const timers = PASSES.map((_, i) =>
      setTimeout(() => setPass(i + 1), PASS_MS * (i + 1))
    );
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, []);

  const current = Math.min(pass, PASSES.length - 1);

  return (
    <div className={styles.hero}>
      {/* the orb IS the AI doing the work — see `.orb-think-*` in globals.css */}
      <Orb className="reveal-hero" thinking />

      <p className={`${styles.title} t-h4`}>Comparing your timeline…</p>

      <ol
        className={styles.passes}
        role="progressbar"
        aria-label="Analysing your products"
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
    </div>
  );
}
