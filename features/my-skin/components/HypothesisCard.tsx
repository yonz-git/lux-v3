"use client";

import styles from "./HypothesisCard.module.css";
import { Disclosure } from "./Disclosure";
import { Tag } from "@/components/ui/Tag";
import { fullName } from "@/features/products/products";
import {
  CONFIDENCE_LABEL,
  headline,
  hypothesisKind,
  hypothesisProducts,
  reasoningFor,
  type Analysis,
  type Hypothesis,
} from "@/features/my-skin/analysis";
import type { Answers } from "@/lib/store/answers";

/**
 * One hypothesis — § 07's result overview, with § 08's reasoning accordions
 * folded into it.
 *
 * ⚠️ NOT IN FIGMA. Listed in `docs/figma-catchup.md`.
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
    <article className={styles.card}>
      <header className={styles.head}>
        <p className={`${styles.kind} t-overline`}>
          {rank ? `${rank}. ` : ""}
          {hypothesisKind(hypothesis)}
        </p>
        <h3 className={`${styles.headline} t-h5`}>{headline(hypothesis)}</h3>

        <div className={styles.tags}>
          {/* ⚠️ THE CONFIDENCE IS A NEUTRAL TAG, NOT A COLOURED BAND. CHECK's
              bands carry `feedback/warning` and `feedback/error`, which share a
              hue — and this is not a warning in the first place. It is how much
              of the comparison held up. */}
          <Tag>{CONFIDENCE_LABEL[hypothesis.confidence]}</Tag>
        </div>

        <ul className={styles.products}>
          {products.map((p) => (
            <li key={p.id} className={`${styles.product} t-body3-body2`}>
              {fullName(p)}
            </li>
          ))}
        </ul>
      </header>

      <div className={styles.reasoning}>
        <p className={`${styles.reasoningLabel} t-label-sm`}>See the reasoning</p>
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
