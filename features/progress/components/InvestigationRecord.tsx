import styles from "./InvestigationRecord.module.css";
import { DataCard } from "@/components/ui/DataCard";
import { formatLong, fromIso } from "@/lib/date";
import type { Answers } from "@/lib/store/answers";

/**
 * § 09 — what the user saved from `/investigation/findings`.
 *
 * ⚠️ NOT IN FIGMA. No analysis frames exist on page `06. Screen Designs`; the
 * recipe is `DataCard` — Surface System B, the same as every other card on this
 * screen — so this adds a card to PROGRESS rather than a treatment.
 *
 * ⚠️ IT IS LABELLED AN INVESTIGATION RECORD, NOT A DIAGNOSIS, AND THE BRIEF
 * SAYS SO IN AS MANY WORDS. This is the only place in the app where a
 * conclusion about the user's skin persists past the screen that produced it,
 * which is exactly where a hedge is most likely to get lost. The card carries
 * the date it was saved for the same reason: a finding is a snapshot of what
 * was known then.
 *
 * ⚠️ IT RENDERS A STORED STRING AND DERIVES NOTHING. `progress.ts` does not
 * import the analysis and must not start: `recordSummary` runs at the moment of
 * saving, so the record cannot quietly change after the user edits their
 * products. See `savedFinding` in `lib/store/answers.ts`.
 */
export function InvestigationRecord({
  finding,
  className,
}: {
  finding: NonNullable<Answers["savedFinding"]>;
  className?: string;
}) {
  const saved = fromIso(finding.date);
  const review = finding.reviewOn ? fromIso(finding.reviewOn) : null;

  return (
    <DataCard className={className} aria-labelledby="investigation-record-title">
      <h2
        id="investigation-record-title"
        className={`${styles.label} t-overline`}
      >
        Investigation record
      </h2>

      <p className={`${styles.summary} t-body3`}>{finding.summary}</p>

      {finding.pausing ? (
        <>
          {/* ⚠️ border/glass on a data card, never border/subtle. */}
          <div className={styles.divider} />
          <div className={styles.observation}>
            <p className={`${styles.pausing} t-body3`}>
              Pausing {finding.pausing}
            </p>
            {review && (
              <p className={`${styles.review} t-label-sm`}>
                Review on {formatLong(review)}
              </p>
            )}
          </div>
        </>
      ) : null}

      {saved && (
        <p className={`${styles.saved} t-label-sm`}>
          Saved {formatLong(saved)} · a record of what was known then, not a
          diagnosis
        </p>
      )}
    </DataCard>
  );
}
