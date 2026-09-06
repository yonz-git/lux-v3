"use client";

import { useRouter } from "next/navigation";
import styles from "./CheckHistory.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { Button } from "@/components/ui/Button";
import { Orb } from "@/components/ui/Orb";
import { ChevronRightIcon } from "@/components/ui/icons";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import {
  BAND_LABEL,
  DEMO_CHECKS,
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
 *
 * ⚠️ A ROW'S PILL IS THE CHECK'S WORST BAND, and no pill means every product in
 * it scored ≥ 80. Same rule as a card: the band is stated in the row's
 * accessible name too, because Risky and Avoid are not separable by colour.
 *
 * ⚠️ THE EMPTY STATE IS NOT DRAWN — the handoff says to reuse the
 * `Check — no profile` empty-state block with "No checks yet", which is what
 * this does.
 */
export function CheckHistory() {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();

  /* What the user actually ran, then the seeded rows below — never merged and
     never re-sorted together, so a real check always sits above the demo. */
  const checks: SavedCheck[] = [...(answers.checks ?? []), ...DEMO_CHECKS];

  function open(check: SavedCheck) {
    setAnswer("viewingCheck", check.id);
    router.push("/check/results");
  }

  if (checks.length === 0) {
    return (
      <HubScreen
        title="Previous analyses"
        nav="check"
        backHref="/check"
        layout="plain"
        center
        tightTop
      >
        <div className={styles.empty}>
          <Orb animateIn />
          <h2 className="t-h4-h3">No analyses yet</h2>
          <p className={`${styles.emptyText} t-body3-body2`}>
            Run a compatibility check and it will appear here.
          </p>
          <Button href="/check/new" className={styles.emptyCta}>
            Start a check
          </Button>
        </div>
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
                className={styles.row}
                onClick={() => open(check)}
                aria-label={`Analysis of ${date}, ${products.length} products — ${BAND_LABEL[band]}`}
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
