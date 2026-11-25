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
                  <li key={item} className="t-body2">
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
