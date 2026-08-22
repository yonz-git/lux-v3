"use client";

import { useRouter } from "next/navigation";
import styles from "./ProductConfirmScreen.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { ChatBubble } from "./ChatBubble";
import { Button } from "./Button";
import { ProductCard } from "./ProductCard";
import { OptionRow } from "./OptionRow";
import { useInvestigation } from "./InvestigationProvider";
import { DURATIONS, bucketFor, SCAN_MATCH, type Duration } from "@/lib/products";

/**
 * `04 — Confirm product` (mobile 577:1430 / desktop 582:1768) and
 * `04 — Product match` (mobile 578:1482 / desktop 582:1862).
 *
 * ONE screen, twice. Both show the product, ask whether it is right, ask how
 * long it has been used, and commit on Continue. Match adds an AI bubble and a
 * "N% match" badge, drops the description, and sends "No" back to search rather
 * than to the search the user just came from. Everything else is identical, so
 * they share a body rather than drifting apart in two files.
 *
 * ⚠️ THE Yes/No PAIR IS THE ANSWER, NOT THE ACTION. A question sits directly
 * above it ("Is this the right product?"), and the footer holds exactly one
 * primary action by design-system rule — so "Yes" answers the question and
 * Continue commits. Wiring "Yes" to commit as well would give the screen two
 * primary actions doing the same thing and leave the question unanswered.
 */
function ConfirmScreen({
  stepId,
  title,
  bubble,
  question,
  yesLabel,
  noLabel,
  noHref,
  durationLabel,
  showDescription,
  matchScore,
}: {
  stepId: "products-confirm" | "products-match";
  title: string;
  bubble?: string;
  question: string;
  yesLabel: string;
  noLabel: string;
  noHref: string;
  durationLabel: string;
  showDescription?: boolean;
  matchScore?: number;
}) {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();
  const draft = answers.productDraft;

  // A deep link lands here with no draft. Render the shell rather than crashing;
  // Continue stays disabled because `isComplete` needs a duration.
  if (!draft) {
    return (
      <QuestionScreen id={stepId} continueWidth="full" contentGap={24}>
        <h1 className="t-h3-h2">{title}</h1>
        <p className={`${styles.missing} t-body3-body2`}>
          No product picked yet — start from Add product.
        </p>
      </QuestionScreen>
    );
  }

  function commit() {
    if (!draft?.duration) return;
    const saved = {
      ...draft.product,
      duration: draft.duration,
      bucket: bucketFor(draft.duration, draft.bucket),
      addedOn: new Date().toISOString(),
    };
    setAnswer("products", (prev) => [
      ...(prev ?? []).filter((p) => p.id !== saved.id),
      saved,
    ]);
  }

  return (
    <QuestionScreen id={stepId} continueWidth="full" contentGap={24} onContinue={commit}>
      <h1 className="t-h3-h2">{title}</h1>

      {bubble && (
        <div className={styles.bubbleWrap}>
          <ChatBubble from="ai" full>
            {bubble}
          </ChatBubble>
        </div>
      )}

      <div className={styles.cardWrap}>
        <ProductCard
          product={draft.product}
          matchScore={matchScore}
          showDescription={showDescription}
        />
      </div>

      <div className={styles.block}>
        <p className={`${styles.label} t-label`} id={`${stepId}-confirm`}>
          {question}
        </p>
        <div className={styles.answers} role="group" aria-labelledby={`${stepId}-confirm`}>
          <Button
            className={styles.answer}
            aria-pressed={draft.confirmed === true}
            onClick={() =>
              setAnswer("productDraft", (prev) =>
                prev ? { ...prev, confirmed: true } : prev
              )
            }
          >
            {yesLabel}
          </Button>
          <Button
            className={styles.answer}
            variant="secondary"
            onClick={() => {
              setAnswer("productDraft", undefined);
              router.push(noHref);
            }}
          >
            {noLabel}
          </Button>
        </div>
      </div>

      <div className={styles.block}>
        <p className={`${styles.label} t-label`} id={`${stepId}-duration`}>
          {durationLabel}
        </p>
        <div
          className={styles.options}
          role="radiogroup"
          aria-labelledby={`${stepId}-duration`}
        >
          {DURATIONS.map((d) => (
            <OptionRow
              key={d}
              control="radio"
              label={d}
              selected={draft.duration === d}
              onSelect={() =>
                setAnswer("productDraft", (prev) =>
                  prev ? { ...prev, duration: d as Duration } : prev
                )
              }
            />
          ))}
        </div>
      </div>
    </QuestionScreen>
  );
}

/** 04 — Confirm product. Reached from a search result. */
export function ConfirmProduct() {
  return (
    <ConfirmScreen
      stepId="products-confirm"
      title="Confirm product"
      question="Is this the right product?"
      yesLabel="Yes, add this"
      noLabel="No, search again"
      noHref="/investigation/products/search"
      durationLabel="How long have you used this product?"
      showDescription
    />
  );
}

/**
 * 04 — Product match. Reached from a scan.
 *
 * The score is the comp's own 92% — a real build would get it from whatever read
 * the photo. If the draft carries no score (a deep link), the badge is omitted
 * rather than a number being made up.
 */
export function ProductMatch() {
  const { answers } = useInvestigation();
  const score = answers.productDraft?.matchScore ?? SCAN_MATCH.score;
  return (
    <ConfirmScreen
      stepId="products-match"
      title="Product match"
      bubble="I think this might be your product. Can you confirm?"
      question="Is this correct?"
      yesLabel="Yes, that's it"
      noLabel="No, let me search"
      noHref="/investigation/products/search"
      durationLabel="How long have you used this?"
      matchScore={score}
    />
  );
}
