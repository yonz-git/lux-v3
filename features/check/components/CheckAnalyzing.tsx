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

/** `Check — analyzing` (605:2163) at `/check/analyzing`. */
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
            05 — Investigating, which this screen was cloned from. */}
        <Orb className="reveal-hero" thinking />

        <h1 className={`${styles.title} t-h4-h3`}>
          LUX is analysing…
        </h1>

        <PassList
          className={styles.passes}
          passes={CHECK_PASSES}
          label="Analysing your products"
        />

        <p className={`${styles.description} t-body2`}>
          Analysing {basket.length}{" "}
          {basket.length === 1 ? "product" : "products"} and{" "}
          {ingredientCount(basket)} ingredients against your skin profile
        </p>
      </div>
    </HubScreen>
  );
}
