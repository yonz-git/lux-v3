"use client";

import styles from "./Findings.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Button } from "@/components/ui/Button";
import { SmallButton } from "@/components/ui/SmallButton";
import { PriorityList } from "./PriorityList";
import { HypothesisCard } from "./HypothesisCard";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import {
  analyseInvestigation,
  investigationPriority,
  ruledOut,
  suggestedPause,
  type Analysis,
} from "@/features/my-skin/analysis";
import { fullName } from "@/features/products/products";

/**
 * `/investigation/findings` — the end of the investigation, and the screen LUX
 * is named for. Product brief §§ 07, 08 and 11.
 *
 * ⚠️ NOT IN FIGMA AT ALL. Page `06. Screen Designs` has no analysis or result
 * frames outside CHECK, so every measurement on this screen is decided here and
 * listed in `docs/figma-catchup.md`. The surfaces are CHECK's — Surface System
 * A, frosted light rows on the canvas — because this is the same species of
 * screen as `/check/results`: an answer, read rather than filled in.
 *
 * ⚠️ NOT A FLOW STEP. No progress track, no `Save & exit`, back chevron kept —
 * a pushed view, the standing `/check/results` has to `/check/new`. It sits
 * under `/investigation` because it REPORTS on what those five steps collected,
 * not because it is a sixth one. `flow.ts` is untouched.
 *
 * ⚠️ ONE ROUTE, THREE OUTCOMES, AND THE REFUSAL IS ONE OF THEM. § 07 offers
 * "leading hypothesis" / "several possible explanations" / "not enough evidence
 * for a responsible conclusion", and § 11's no-conclusion route is that third
 * outcome rather than a different destination. Sending a refusal to its own URL
 * would make it an error page; it is an answer.
 *
 * ⚠️ THE NO-CONCLUSION OUTCOME WAS BUILT FIRST, DELIBERATELY. Open Beauty Facts
 * ingredient coverage is patchy and the gates are strict, so this is the state
 * most real runs land in. Built last it would have been built worst.
 *
 * ⚠️ AND IT NEVER SAYS A PRODUCT CAUSED ANYTHING. The brief's controlled
 * vocabulary is a regulatory constraint, not a tone preference — see
 * `docs/decisions.md`, "Claim language". Every sentence on this screen is
 * hedged, and the words it may and may not use are listed in
 * `features/my-skin/analysis.ts`.
 */
export function Findings() {
  const { answers } = useInvestigation();
  const analysis = analyseInvestigation(answers);

  return (
    <HubScreen
      title="Investigation findings"
      nav="my-skin"
      backHref="/investigation/products"
      layout="card"
      tightTop
    >
      {analysis.outcome === "none" ? (
        <NoConclusion analysis={analysis} />
      ) : (
        <Hypotheses analysis={analysis} />
      )}
    </HubScreen>
  );
}

/**
 * § 11 — "Explain the exact reason." Not a generic failure: the screen names
 * what is missing, offers to complete it FIRST, and only then offers the
 * one-product-at-a-time route for someone who cannot.
 */
function NoConclusion({ analysis }: { analysis: Analysis }) {
  const { answers } = useInvestigation();
  const priority = investigationPriority(answers);
  const primary = analysis.gaps[0];

  return (
    <>
      <ChatBubble from="ai" full className={styles.bubble}>
        <span className={styles.verdict}>
          There is not enough here for me to point at anything yet — and
          guessing would be worse than saying so.
        </span>
      </ChatBubble>

      <section className={styles.block} aria-labelledby="gaps-heading">
        <h2 id="gaps-heading" className={`${styles.heading} t-h5`}>
          What is missing
        </h2>

        <ul className={styles.gaps}>
          {analysis.gaps.map((gap) => (
            <li key={gap.id} className={styles.gap}>
              <p className={`${styles.gapTitle} t-h6`}>{gap.title}</p>
              <p className={`${styles.gapBody} t-body3-body2`}>{gap.body}</p>
              <SmallButton
                label={gap.action}
                arrow
                href={gap.href}
                className={styles.gapAction}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* § 11 puts "Complete missing information" FIRST and the priority list
          second, and the order is the argument: the analysis would rather have
          the evidence than work around not having it. */}
      {primary ? (
        <Button href={primary.href} fullWidth className={styles.primary}>
          Complete missing information
        </Button>
      ) : null}

      {priority.length > 0 ? (
        <section className={styles.block} aria-labelledby="priority-heading">
          <h2 id="priority-heading" className={`${styles.heading} t-h5`}>
            Or investigate one product at a time
          </h2>
          <p className={`${styles.lede} t-body3-body2`}>
            Ranked by how much you would learn from pausing each one — not by
            how risky they are. Open a product to see why it sits where it does.
          </p>
          <PriorityList entries={priority} />
        </section>
      ) : null}
    </>
  );
}

/**
 * Outcomes 1 and 2 — "leading hypothesis found" and "several possible
 * explanations remain".
 *
 * ⚠️ ONE COMPONENT FOR BOTH, BECAUSE THEY ARE THE SAME SCREEN WITH A DIFFERENT
 * NUMBER OF CARDS. § 07 lists them as separate outcomes and they read
 * differently, but the difference is entirely in the opening sentence and
 * whether the cards are ranked. Splitting them would give the app two places to
 * change the reasoning layout and one of them would rot.
 */
function Hypotheses({ analysis }: { analysis: Analysis }) {
  const { answers } = useInvestigation();
  const several = analysis.outcome === "several";
  const pause = suggestedPause(answers);

  return (
    <>
      <ChatBubble from="ai" full className={styles.bubble}>
        <span className={styles.verdict}>
          {several
            ? "Two explanations still fit what you recorded, and neither is better supported than the other. I would rather show you both than pick one."
            : "This is what currently fits your recorded pattern best. It is a place to look, not a cause."}
        </span>
      </ChatBubble>

      <section className={styles.block} aria-labelledby="hypotheses-heading">
        <h2 id="hypotheses-heading" className={`${styles.heading} t-h5`}>
          {several ? "What still fits" : "What fits your recorded pattern"}
        </h2>
        <div className={styles.cards}>
          {analysis.hypotheses.map((h, i) => (
            <HypothesisCard
              key={h.id}
              hypothesis={h}
              analysis={analysis}
              answers={answers}
              rank={several ? i + 1 : undefined}
            />
          ))}
        </div>
      </section>

      {/* ⚠️ THE RULED-OUT BLOCK IS TOP-LEVEL, NOT BURIED IN AN ACCORDION. These
          are candidates the user's OWN tolerated history knocked out, and they
          are the most useful thing this analysis produces: the ingredient
          someone would blame first, cleared by a product they have been using
          for a month. It is also free — the discarded half of the same
          comparison. Hiding it inside a hypothesis would attach it to one
          argument when it is a fact about all of them. */}
      {analysis.cleared.length > 0 ? (
        <section className={styles.block} aria-labelledby="cleared-heading">
          <h2 id="cleared-heading" className={`${styles.heading} t-h5`}>
            Ruled out by what you already tolerate
          </h2>
          <p className={`${styles.lede} t-body3-body2`}>
            These looked like candidates until your longer-standing products
            were checked for them.
          </p>
          <ul className={styles.cleared}>
            {analysis.cleared.map((h) => (
              <li key={h.id} className={`${styles.clearedItem} t-body3-body2`}>
                {ruledOut(h)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* § 10 — the cautious next action. ⚠️ SUNSCREEN CAN NEVER BE PROPOSED
          HERE; the exclusion is in `pausableProducts`, not in this copy. */}
      {pause ? (
        <section className={styles.block} aria-labelledby="next-heading">
          <h2 id="next-heading" className={`${styles.heading} t-h5`}>
            One cautious thing to try
          </h2>
          <div className={styles.gap}>
            <p className={`${styles.gapTitle} t-h6`}>
              Pause {fullName(pause.product)} for four weeks
            </p>
            <p className={`${styles.gapBody} t-body3-body2`}>
              Keep everything else the same, so there is only one change to read.
              Record how your skin is doing as you go.
            </p>
            <SmallButton
              label="Start a four-week observation"
              arrow
              href="/progress/check-in"
              className={styles.gapAction}
            />
          </div>
          <p className={`${styles.lede} t-caption`}>
            If any of your products were prescribed, ask whoever prescribed them
            before pausing anything.
          </p>
        </section>
      ) : null}

      <Button href="/progress" fullWidth className={styles.primary}>
        Save to my investigation
      </Button>
    </>
  );
}
