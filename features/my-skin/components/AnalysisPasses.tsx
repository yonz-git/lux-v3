"use client";

import styles from "./AnalysisPasses.module.css";
import { Orb } from "@/components/ui/Orb";
import { PassList, passesDuration } from "@/components/ui/PassList";
import { ANALYSIS_PASSES } from "@/features/my-skin/analysis";

/** How long this state lasts before the result replaces it. */
export const PASSES_TOTAL_MS = passesDuration(ANALYSIS_PASSES.length);

/**
 * § 06 — the analysis running.
 *
 * ⚠️ IT IS A STATE, NOT A ROUTE, AS OF 6 SEP 2026. It was
 * `/investigation/analyzing`, one of three screens between step 5 and an
 * answer; three routes for one question read as three more steps, which was
 * exactly the complaint. The wait is now the first two seconds of
 * `/investigation/analysis` and the app has one analysis screen.
 *
 * ⚠️ THE LIST ITSELF IS `components/ui/PassList` AND IS SHARED WITH
 * `/check/analyzing`. The lines are not: they live in
 * `features/my-skin/analysis.ts` beside the passes they name. CHECK has five,
 * this has six, and they must not be reconciled — see `CHECK_PASSES`.
 *
 * ⚠️ THE ORB IS THE MARK DOING THE WORK, not a spinner. See `.orb-think-*` in
 * `globals.css`.
 */
export function AnalysisPasses() {
  return (
    <div className={styles.hero}>
      <Orb className="reveal-hero" thinking />

      <p className={`${styles.title} t-h4`}>Comparing your timeline…</p>

      <PassList passes={ANALYSIS_PASSES} label="Analysing your products" />
    </div>
  );
}
