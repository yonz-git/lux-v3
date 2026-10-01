"use client";

import styles from "./HypothesisCard.module.css";
import { Disclosure } from "./Disclosure";
import { fullName } from "@/features/products/products";
import {
  CONFIDENCE_LABEL,
  hypothesisKind,
  hypothesisProducts,
  reasoningFor,
  subject,
  type Analysis,
  type Hypothesis,
} from "@/features/my-skin/analysis";
import type { Answers } from "@/lib/store/answers";

/**
 * One hypothesis — § 07's result overview, with § 08's reasoning accordions
 * folded into it.
 *
 * ⚠️ NOT IN FIGMA. Listed in `docs/archive/figma-catchup.md`.
 *
 * ⚠️ NO SCORE, NO BAR, NO PERCENTAGE. `CompatCard` renders `{score}%` with a
 * fill whose width equals it, and this card deliberately does the opposite: the
 * brief says "do not show a scientific-looking percentage", and the reason is
 * specific to THIS screen rather than to numbers in general. CHECK's score is a
 * model output about a product; this is a judgement about causation made from
 * four coarse duration buckets and an ingredient list of unknown concentration.
 * A number would dress that up as a measurement. The confidence is a WORD —
 * stronger, possible, weak — derived from the shape of the comparison. Counts
 * of products are facts and are shown; a score is not.
 *
 * ⚠️ THE CONFIDENCE IS A COLOURED PILL, THE SAME DEVICE `CompatCard` USES FOR
 * ITS BAND — one `--band` custom property set by a `data-` attribute, so the
 * pill and the card's edge cannot drift apart. It carries no percentage and no
 * bar: the brief forbids a scientific-looking number on a hypothesis, and this
 * judgement is made from four coarse duration buckets. ⚠️ The pill's TEXT is
 * always the carrier — colour never says it alone (non-negotiable 7).
 *
 * ⚠️ THE ACCORDION ORDER IS THE BRIEF'S AND IT IS THE ARGUMENT'S SHAPE:
 * relevance, then the skin profile, then interactions, then EVIDENCE AGAINST,
 * then what was excluded, then what would change the answer. Evidence against
 * sits fourth rather than last on purpose — a case that puts its own
 * counter-evidence at the bottom, after the reader has stopped scrolling, is
 * advocacy wearing an accordion.
 */
export function HypothesisCard({
  hypothesis,
  analysis,
  answers,
  rank,
}: {
  hypothesis: Hypothesis;
  analysis: Analysis;
  answers: Answers;
  /** shown only when several explanations remain — omitted for a lone leader */
  rank?: number;
}) {
  const reasoning = reasoningFor(hypothesis, analysis, answers);
  const products = hypothesisProducts(hypothesis);

  const sections: { label: string; items: string[]; tone?: "against" }[] = [
    { label: "Why this may be relevant", items: reasoning.relevance },
    { label: "How your skin profile was considered", items: reasoning.profile },
    { label: "Possible same-routine interactions", items: reasoning.interactions },
    {
      label: "Evidence against this explanation",
      items: reasoning.against,
      tone: "against",
    },
    { label: "Uncertain or excluded evidence", items: reasoning.excluded },
    { label: "What could change this result", items: reasoning.couldChange },
  ];

  return (
    <article className={styles.card} data-confidence={hypothesis.confidence}>
      <header className={styles.head}>
        <div className={styles.topline}>
          <p className={`${styles.kind} t-overline`}>
            {rank ? `${rank}. ` : ""}
            {hypothesisKind(hypothesis)}
          </p>
          <span className={`${styles.pill} t-label-sm`}>
            {CONFIDENCE_LABEL[hypothesis.confidence]}
          </span>
        </div>

        {/* ⚠️ `subject`, NOT `headline`. The overline directly above already
            says "Possible contributor", so `headline`'s "A possible contributor:
            Alcohol Denat." said it twice in two lines. `headline` keeps the
            framing for the saved PROGRESS record, where nothing else supplies
            it. */}
        <h3 className={`${styles.headline} t-h5`}>{subject(hypothesis)}</h3>

        <ul className={styles.products}>
          {products.map((p) => (
            <li key={p.id} className={`${styles.product} t-body3-body2`}>
              {fullName(p)}
            </li>
          ))}
        </ul>
      </header>

      <div className={styles.reasoning}>
        {sections
          .filter((s) => s.items.length > 0)
          .map((s) => (
            <Disclosure
              key={s.label}
              label={s.label}
              meta={String(s.items.length)}
              tone={s.tone}
            >
              <ul className={styles.points}>
                {s.items.map((item) => (
                  <li key={item} className="t-body3">
                    {item}
                  </li>
                ))}
              </ul>
            </Disclosure>
          ))}
      </div>
    </article>
  );
}
