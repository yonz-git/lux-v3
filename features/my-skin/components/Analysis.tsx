"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Analysis.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { DataCard } from "@/components/ui/DataCard";
import { Button } from "@/components/ui/Button";
import { SmallButton } from "@/components/ui/SmallButton";
import { Chip } from "@/components/ui/Chip";
import { AnalysisPasses, PASSES_TOTAL_MS } from "./AnalysisPasses";
import { PriorityList } from "./PriorityList";
import { HypothesisCard } from "./HypothesisCard";
import { Disclosure } from "./Disclosure";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import {
  analyseInvestigation,
  gaps,
  investigationPriority,
  forgottenRoles,
  needsConfirmation,
  ruledOut,
  severalVerdict,
  splitHypotheses,
  suggestedPause,
  recordSummary,
  verdictLine,
  subject,
  OBSERVATION_WEEKS,
  CONFIDENCE_LABEL,
  type Analysis as AnalysisResult,
} from "@/features/my-skin/analysis";
import { ownedProducts } from "@/features/products/library";
import { fullName } from "@/features/products/products";
import { addDays, toIso } from "@/lib/date";

/**
 * `/investigation/analysis` — the end of the investigation, and the screen LUX
 * is named for. Product brief §§ 05–12.
 */
export function Analysis() {
  const { answers } = useInvestigation();
  const analysis = analyseInvestigation(answers);

  const [running, setRunning] = useState(() => gaps(answers).length === 0);

  /* the one refusal that is a question rather than a dead end — see `center` */
  const unresolved = analysis.gaps[0]?.id === "unresolved-timeline";
  /* biome-ignore lint/correctness/useExhaustiveDependencies: RUNS ONCE, ON
     MOUNT. The initial `running` is computed from the gates in the `useState`
     initialiser above, so this timer only ever needs to end the wait — listing
     `answers` would restart it every time the user taps the confirmation
     strip, which is the one interaction that must not cost two seconds. */
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setRunning(false), PASSES_TOTAL_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <HubScreen
      title="Analysis"
      nav="my-skin"
      backHref="/investigation/products"
      layout="card"
      tightTop
      center={!running && analysis.outcome === "none" && !unresolved}
    >
      {running ? (
        <AnalysisPasses />
      ) : analysis.outcome === "none" ? (
        <NoConclusion analysis={analysis} />
      ) : (
        <Hypotheses analysis={analysis} />
      )}
    </HubScreen>
  );
}

/* ---------------------------------------------------------------------------
   The verdict card — Surface System B, and the screen's one big statement
   -------------------------------------------------------------------------- */

function Verdict({
  overline,
  children,
}: {
  overline: string;
  children: React.ReactNode;
}) {
  return (
    <DataCard className={styles.verdict}>
      <p className={`${styles.verdictOverline} t-overline`}>{overline}</p>
      <p className={`${styles.verdictText} t-h5`}>{children}</p>
    </DataCard>
  );
}

/* ---------------------------------------------------------------------------
   Outcomes 1 and 2 — a leading hypothesis, or several that still fit
   -------------------------------------------------------------------------- */

function Hypotheses({ analysis }: { analysis: AnalysisResult }) {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();
  const several = analysis.outcome === "several";
  const pause = suggestedPause(answers);
  const { leading, alsoConsidered } = splitHypotheses(analysis);

  /**
   * § 09 — "Saving creates a calendar entry." Both actions save; starting an
   * observation is the same record with a product paused and a review date.
   */
  function save(pausing?: string) {
    const today = new Date();
    setAnswer("savedFinding", () => ({
      id: `finding-${Date.now()}`,
      date: toIso(today),
      summary: recordSummary(analysis),
      ...(pausing
        ? { pausing, reviewOn: toIso(addDays(today, OBSERVATION_WEEKS * 7)) }
        : {}),
    }));
    router.push(pausing ? "/progress/check-in" : "/progress");
  }

  return (
    <>
      <Verdict
        overline={
          several
            ? leading.length === 2
              ? "Two explanations still fit"
              : `${leading.length} explanations still fit`
            : "Best fit so far"
        }
      >
        {several ? severalVerdict(analysis) : verdictLine(analysis)}
      </Verdict>

      <Confirmations />

      <div className={styles.cards}>
        {leading.map((h, i) => (
          <HypothesisCard
            key={h.id}
            hypothesis={h}
            analysis={analysis}
            answers={answers}
            rank={several ? i + 1 : undefined}
          />
        ))}
      </div>

      {alsoConsidered.length > 0 ? (
        <div className={styles.foot}>
          <Disclosure
            label="Also possible, on thinner evidence"
            meta={String(alsoConsidered.length)}
          >
            <ul className={styles.plain}>
              {alsoConsidered.map((h) => (
                <li key={h.id} className="t-body2">
                  {subject(h)}, {CONFIDENCE_LABEL[h.confidence].toLowerCase()}
                </li>
              ))}
            </ul>
          </Disclosure>
        </div>
      ) : null}

      {analysis.cleared.length > 0 ? (
        <section className={styles.cleared} aria-labelledby="cleared-heading">
          <h2 id="cleared-heading" className={`${styles.clearedTitle} t-overline`}>
            Ruled out by what you tolerate
          </h2>
          <ul className={styles.plain}>
            {analysis.cleared.map((h) => (
              <li key={h.id} className="t-body2">
                {ruledOut(h)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Reminder />

      {/* § 10 — the cautious next action. */}
      {pause ? (
        <section className={styles.next} aria-labelledby="next-heading">
          <h2 id="next-heading" className={`${styles.nextTitle} t-h6`}>
            Pause {fullName(pause.product)} for four weeks?
          </h2>
          <p className={`${styles.nextBody} t-body2`}>
            Keep everything else the same, so there is only one change to read.
          </p>
          <div className={styles.actions}>
            <Button onClick={() => save(fullName(pause.product))}>
              Start the observation
            </Button>
            <SmallButton
              label="Just save this"
              arrow={false}
              onClick={() => save()}
              className={styles.secondary}
            />
          </div>
          <p className={`${styles.fineprint} t-caption`}>
            If anything here was prescribed, ask whoever prescribed it first.
          </p>
        </section>
      ) : (
        <Button onClick={() => save()} className={styles.lone}>
          Save this analysis
        </Button>
      )}
    </>
  );
}

/* ---------------------------------------------------------------------------
   Outcome 3 — not enough evidence
   -------------------------------------------------------------------------- */

function NoConclusion({ analysis }: { analysis: AnalysisResult }) {
  const { answers } = useInvestigation();
  const priority = investigationPriority(answers);
  const gap = analysis.gaps[0];
  const unresolved = gap?.id === "unresolved-timeline";

  return (
    <>
      <Verdict overline={unresolved ? "One thing to settle first" : "Not enough to go on yet"}>
        {gap ? gap.title : "Nothing survived the comparison."}
      </Verdict>

      {gap ? (
        <div className={styles.gap}>
          <p className={`${styles.nextBody} t-body2`}>{gap.body}</p>
          {/* a gap with no destination is answered inline — see `Gap.href` */}
          {gap.href && gap.action ? (
            <Button href={gap.href}>{gap.action}</Button>
          ) : null}
        </div>
      ) : null}

      {/* § 05's confirmation list. */}
      <Confirmations headed={!unresolved} />

      <Reminder />

      {/* § 11 — for someone who cannot complete the information. Collapsed:
          it is the fallback, not the offer. */}
      {priority.length > 0 ? (
        <div className={styles.foot}>
          <Disclosure
            label="Or investigate one product at a time"
            meta={String(priority.length)}
          >
            <p className={`${styles.fineprint} t-caption`}>
              Ranked by what you would learn from pausing each one, not by how
              risky they are.
            </p>
            <PriorityList entries={priority} />
          </Disclosure>
        </div>
      ) : null}
    </>
  );
}

/* ---------------------------------------------------------------------------
   The two things the deleted evidence screen was for
   -------------------------------------------------------------------------- */

/** § 05's confirmation list, inline. */
function Confirmations({ headed = true }: { headed?: boolean }) {
  const { answers, setAnswer } = useInvestigation();
  const ambiguous = needsConfirmation(answers);
  if (ambiguous.length === 0) return null;

  const set = (id: string, state: "associated" | "tolerated") =>
    setAnswer("evidence", (prev) => ({ ...(prev ?? {}), [id]: state }));

  return (
    <section
      className={styles.confirm}
      aria-labelledby={headed ? "confirm-heading" : undefined}
      aria-label={headed ? undefined : "Could go either way"}
    >
      {headed ? (
        <h2 id="confirm-heading" className={`${styles.confirmTitle} t-overline`}>
          Could go either way
        </h2>
      ) : null}
      {ambiguous.map((e) => (
        <div key={e.product.id} className={styles.confirmRow}>
          <p className={`${styles.confirmName} t-body2`}>
            {fullName(e.product)}, did you start it around the reaction?
          </p>
          <div className={styles.confirmChips}>
            <Chip
              label="Around then"
              selected={e.confirmed && e.state === "associated"}
              onToggle={() => set(e.product.id, "associated")}
            />
            <Chip
              label="Long before"
              selected={e.confirmed && e.state === "tolerated"}
              onToggle={() => set(e.product.id, "tolerated")}
            />
          </div>
        </div>
      ))}
    </section>
  );
}

/** The cleanser / sunscreen line. */
function Reminder() {
  const { answers } = useInvestigation();
  const missing = forgottenRoles(answers);
  if (missing.length === 0 || ownedProducts(answers).length === 0) return null;

  return (
    <p className={`${styles.reminder} t-body3`}>
      No {missing.join(" or ")} in your list, if you use{" "}
      {missing.length === 1 ? "one" : "either"}, adding{" "}
      {missing.length === 1 ? "it" : "them"} may change this.{" "}
      <Link href="/investigation/products" className={styles.reminderLink}>
        Add a product
      </Link>
    </p>
  );
}
