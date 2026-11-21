"use client";

import styles from "./AnalysisPasses.module.css";
import { Orb } from "@/components/ui/Orb";
import { PassList, passesDuration } from "@/components/ui/PassList";
import { ANALYSIS_PASSES } from "@/features/my-skin/analysis";

/** How long this state lasts before the result replaces it. */
export const PASSES_TOTAL_MS = passesDuration(ANALYSIS_PASSES.length);

/** § 06 — the analysis running. */
export function AnalysisPasses() {
  return (
    <div className={styles.hero}>
      <Orb className="reveal-hero" thinking />

      <p className={`${styles.title} t-h4-h3`}>Comparing your timeline…</p>

      <PassList passes={ANALYSIS_PASSES} label="Analysing your products" />
    </div>
  );
}
