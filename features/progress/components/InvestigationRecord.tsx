import styles from "./InvestigationRecord.module.css";
import { DataCard } from "@/components/ui/DataCard";
import { formatLong, fromIso } from "@/lib/date";
import type { Answers } from "@/lib/store/answers";

/** § 09 — what the user saved from `/investigation/findings`. */
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

      <p className={`${styles.summary} t-body2`}>{finding.summary}</p>

      {finding.pausing ? (
        <>
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
