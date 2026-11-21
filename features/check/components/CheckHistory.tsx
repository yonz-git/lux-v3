"use client";

import { useRouter } from "next/navigation";
import styles from "./CheckHistory.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChevronRightIcon } from "@/components/ui/icons";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import {
  BAND_LABEL,
  analyseCheck,
  formatCheckDate,
  productsOf,
  worstBand,
  type SavedCheck,
} from "@/features/check/check";

/**
 * `Check — previous checks` (652:2554) at `/check/history`.
 *
 * The destination for "View previous analyses" on the Analysis landing — the handoff
 * added this screen precisely so that link was no longer dangling.
 */
export function CheckHistory() {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();

  /* what the user ran this visit, newest first */
  const checks: SavedCheck[] = answers.checks ?? [];

  function open(check: SavedCheck) {
    setAnswer("viewingCheck", check.id);
    /* back on the results then returns here, not to the hub */
    router.push("/check/results?from=history");
  }

  if (checks.length === 0) {
    return (
      <HubScreen
        title="Previous analyses"
        nav="check"
        backHref="/check"
        layout="plain"
        center="empty"
        tightTop
      >
        <EmptyState
          title="No analyses yet"
          action={{ label: "Start a check", href: "/check/new" }}
        >
          Run a compatibility check and it will appear here.
        </EmptyState>
      </HubScreen>
    );
  }

  return (
    <HubScreen
      title="Previous analyses"
      nav="check"
      backHref="/check"
      layout="card"
      tightTop
    >
      <ul className={styles.list}>
        {checks.map((check) => {
          const products = productsOf(check);
          const band = worstBand(analyseCheck(products));
          const date = formatCheckDate(check.date);

          return (
            <li key={check.id}>
              <button
                type="button"
                className={`${styles.row} pressable`}
                onClick={() => open(check)}
                aria-label={`Analysis of ${date}, ${products.length} products, ${BAND_LABEL[band]}`}
              >
                <span className={styles.copy}>
                  <span className={`${styles.date} t-h6`}>{date}</span>
                  <span className={`${styles.count} t-caption`}>
                    {products.length}{" "}
                    {products.length === 1 ? "product" : "products"}
                  </span>
                </span>

                {/* compatible draws no pill — the absence is the signal */}
                {band !== "compatible" && (
                  <span
                    className={`${styles.pill} t-label-sm`}
                    data-band={band}
                    aria-hidden="true"
                  >
                    {BAND_LABEL[band]}
                  </span>
                )}

                <ChevronRightIcon className={styles.chevron} />
              </button>
            </li>
          );
        })}
      </ul>
    </HubScreen>
  );
}
