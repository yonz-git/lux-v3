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
  splitHypotheses,
  suggestedPause,
  recordSummary,
  verdictLine,
  subject,
  OBSERVATION_WEEKS,
  CONFIDENCE_LABEL,
  type Analysis as AnalysisResult,
} from "@/features/my-skin/analysis";
import { fullName } from "@/features/products/products";
import { addDays, toIso } from "@/lib/date";

/**
 * `/investigation/analysis` — the end of the investigation, and the screen LUX
 * is named for. Product brief §§ 05–12.
 *
 * ⚠️ ONE ROUTE, NOT THREE, AS OF 6 SEP 2026. It shipped as
 * `evidence` → `analyzing` → `findings`, and three screens between step 5 and
 * an answer read as three more steps — which was the first thing anyone said
 * about it. `analyzing` is now the first two seconds of this screen and
 * `evidence` is gone entirely: its confirmation question moved here as an
 * inline strip, its cleanser prompt became one line, and its read-only summary
 * of what the timeline worked out was deleted, being exactly the "too much
 * reading" it was accused of.
 *
 * ⚠️ "ANALYSIS" IS THE ONLY WORD FOR THIS NOW. It was "findings"; the app was
 * calling one idea three things — investigation, check, findings — and the word
 * the product actually means is analysis. See `docs/decisions.md`.
 *
 * ⚠️ NOT IN FIGMA AT ALL. Page `06. Screen Designs` has no analysis frames
 * outside CHECK, so every measurement here is decided in the prototype and
 * listed in `docs/figma-catchup.md`.
 *
 * ⚠️ NOT A FLOW STEP. No progress track, no `Save & exit`, back chevron kept —
 * a pushed view, the standing `/check/results` has to `/check/new`.
 * `TOTAL_STEPS` is still 5.
 *
 * ⚠️ THE VERDICT IS A SAGE DATA CARD, WHICH IS WHERE THE CONTRAST WITH
 * `/check/results` WAS MISSING. That screen leads with a sage block and colours
 * its bands; this one was a wall of frosted grey beside it, and the answer was
 * the hardest thing on it to find. Surface System B is the readout surface and
 * a verdict IS a readout, so the one sage card is the one thing you see first.
 *
 * Below it, colour carries the argument: a WARM band on the strongest
 * hypothesis, GREEN on what the user's own history has ruled out, grey on what
 * is weak. ⚠️ Always as a fill or a stripe and never as a text colour — the
 * measurements are in `Analysis.module.css`, and every colour is paired with a
 * word regardless (non-negotiable 7).
 */
export function Analysis() {
  const { answers } = useInvestigation();
  const analysis = analyseInvestigation(answers);

  /* ⚠️ THE PASSES ONLY RUN IF THERE IS SOMETHING TO COMPARE. `gaps()` non-empty
     means the analysis was stopped before it started — no flare date, or
     nothing new and nothing readable — and narrating six comparisons for two
     seconds before admitting none of them happened is precisely the thing the
     pass list is documented as not doing. Deep-link here with an empty store
     and the answer is immediate.

     ⚠️ AND WHEN THEY DO RUN, THEY RUN ONCE, ON ARRIVAL — not on every render
     and not when the user answers the confirmation strip. Re-running a
     two-second wait because someone corrected a date would punish the
     correction. */
  const [running, setRunning] = useState(() => gaps(answers).length === 0);
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
      /* ⚠️ NOT `center`, AND IT WAS TRIED ON 8 Sep 2026. `NoConclusion` is
         allowed to be three short blocks — a verdict card, one sentence and one
         button — which at 440 leaves roughly 700px of bare canvas under the
         button. `HubScreen`'s `center` looked like the answer and is not: with
         `layout="card"` the page heading renders INSIDE `.body`, so centring the
         block centres the title with it and "Analysis" floated to the middle of
         the screen above a card. Every other `center` caller in the app pairs it
         with `layout="plain"`, where the heading sits outside the body and stays
         at the top — that is what makes the pattern work on `/progress/empty`
         and `/check/no-profile`.

         So the two ways to close this are: hoist the heading out of the centred
         region for `card` + `center` in `HubScreen` (a shared-component change,
         and this is the only caller that would use it), or give the refusal
         outcome its own `plain` shell. Both are real options; neither is a
         one-line fix, and the void is a resting-state looseness rather than a
         defect. Left as it is, written down rather than half-solved. */
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
   *
   * ⚠️ THE SUMMARY IS FROZEN AT THE MOMENT OF SAVING — see `savedFinding` in
   * `answers.ts`. A record that re-derived itself would quietly change the day
   * the user edited their products.
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
      <Verdict overline={several ? "Two explanations still fit" : "Best fit so far"}>
        {several
          ? "Neither is better supported than the other, so here are both."
          : verdictLine(analysis)}
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

      {/* ⚠️ COLLAPSED, AND IT USED TO BE A HEADED SECTION WITH A BULLET LIST.
          Everything that survived the comparison is still reported — but a
          candidate the analysis has already called weak does not earn four
          lines above the fold. */}
      {alsoConsidered.length > 0 ? (
        <div className={styles.foot}>
          <Disclosure
            label="Also possible, on thinner evidence"
            meta={String(alsoConsidered.length)}
          >
            <ul className={styles.plain}>
              {alsoConsidered.map((h) => (
                <li key={h.id} className="t-body3">
                  {subject(h)} — {CONFIDENCE_LABEL[h.confidence].toLowerCase()}
                </li>
              ))}
            </ul>
          </Disclosure>
        </div>
      ) : null}

      {/* ⚠️ THE ONE GREEN BLOCK ON THE SCREEN, AND IT IS NOT DECORATION. These
          are candidates the user's OWN tolerated history knocked out — the
          ingredient someone would blame first, cleared by a product they have
          used for a month. It is the most useful thing the analysis produces
          and it is free, being the discarded half of the same comparison. */}
      {analysis.cleared.length > 0 ? (
        <section className={styles.cleared} aria-labelledby="cleared-heading">
          <h2 id="cleared-heading" className={`${styles.clearedTitle} t-overline`}>
            Ruled out by what you tolerate
          </h2>
          <ul className={styles.plain}>
            {analysis.cleared.map((h) => (
              <li key={h.id} className="t-body3">
                {ruledOut(h)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Reminder />

      {/* § 10 — the cautious next action. ⚠️ Sunscreen can never be proposed
          here; the exclusion is in `pausableProducts`, in code, not in copy. */}
      {pause ? (
        <section className={styles.next} aria-labelledby="next-heading">
          <h2 id="next-heading" className={`${styles.nextTitle} t-h6`}>
            Pause {fullName(pause.product)} for four weeks?
          </h2>
          <p className={`${styles.nextBody} t-body3`}>
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

  return (
    <>
      <Verdict overline="Not enough to go on yet">
        {gap ? gap.title : "Nothing survived the comparison."}
      </Verdict>

      {gap ? (
        <div className={styles.gap}>
          <p className={`${styles.nextBody} t-body3`}>{gap.body}</p>
          <Button href={gap.href}>{gap.action}</Button>
        </div>
      ) : null}

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
              Ranked by what you would learn from pausing each one — not by how
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

/**
 * § 05's confirmation list, inline.
 *
 * ⚠️ IT APPEARS ONLY WHEN THE TIMELINE IS GENUINELY AMBIGUOUS, AND IT IS NOT A
 * STOP. `deriveEvidence` returns `unclear` only when a product's introduction
 * range straddles the reaction, so this is usually absent. Answering re-runs
 * the comparison in place — no wait, no navigation.
 */
function Confirmations() {
  const { answers, setAnswer } = useInvestigation();
  const ambiguous = needsConfirmation(answers);
  if (ambiguous.length === 0) return null;

  const set = (id: string, state: "associated" | "tolerated") =>
    setAnswer("evidence", (prev) => ({ ...(prev ?? {}), [id]: state }));

  return (
    <section className={styles.confirm} aria-labelledby="confirm-heading">
      <h2 id="confirm-heading" className={`${styles.confirmTitle} t-overline`}>
        Could go either way
      </h2>
      {ambiguous.map((e) => (
        <div key={e.product.id} className={styles.confirmRow}>
          <p className={`${styles.confirmName} t-body3`}>
            {fullName(e.product)} — did you start it around the reaction?
          </p>
          {/* ⚠️ CHIPS, NOT RADIO ROWS. The selection-controls contract allows a
              radio CHIP only for a short ordinal scale, so these two carry
              `role="checkbox"` and the exclusivity is enforced by the handler:
              answering one replaces the other. Two rows of 56 for a question
              that is usually absent was most of why the old screen felt heavy. */}
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

/**
 * The cleanser / sunscreen line.
 *
 * ⚠️ A REMINDER, NEVER A REQUIREMENT — changed 6 Sep 2026. It was a GATE: the
 * analysis refused to run until a cleanser and a sunscreen were either added or
 * explicitly declared unused. That is the app deciding someone's routine is
 * incomplete, which is not its call. It asks once, quietly, at the bottom, and
 * the analysis has already run either way.
 */
function Reminder() {
  const { answers } = useInvestigation();
  const missing = forgottenRoles(answers);
  /* ⚠️ NOT WHEN THE LIST IS EMPTY. With no products at all, the screen is
     already asking for products; adding "and by the way, no cleanser either" is
     the same request twice, in a quieter voice. */
  if (missing.length === 0 || (answers.products?.length ?? 0) === 0) return null;

  return (
    <p className={`${styles.reminder} t-body3`}>
      No {missing.join(" or ")} in your list — if you use{" "}
      {missing.length === 1 ? "one" : "either"}, adding{" "}
      {missing.length === 1 ? "it" : "them"} may change this.{" "}
      {/* ⚠️ `Link`, NOT `<a href>`. The answer store is in memory only, so a
          hard navigation here would drop everything the user just entered. */}
      <Link href="/investigation/products" className={styles.reminderLink}>
        Add a product
      </Link>
    </p>
  );
}
