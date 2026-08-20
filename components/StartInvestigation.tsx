"use client";

import styles from "./StartInvestigation.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { Chip } from "./Chip";
import { PlusIcon } from "./icons";
import { useInvestigation } from "./InvestigationProvider";
import { toggleMulti } from "@/lib/answers";

/**
 * 01 — Start investigation. Figma mobile 476:2542, desktop 476:2670. Step 1/8.
 *
 * Symptoms are CHIPS because they are short multi-select labels — that is the
 * documented use for Chip, and it must not be "normalised" to rows.
 *
 * NOTHING starts selected. The Figma frame shows "Redness" chosen because a comp
 * has to show a filled-in state; the prototype starts empty and Continue stays
 * disabled until at least one symptom is picked.
 */
const SYMPTOMS = [
  "Redness",
  "Itching",
  "Dryness",
  "Breakouts",
  "Irritation",
  "Swelling",
  "Flaking",
  "Rash",
];

export function StartInvestigation() {
  const { answers, setAnswer } = useInvestigation();
  const selected = answers.start ?? [];

  return (
    <QuestionScreen id="start" gapBeforeContinue={104}>
      <section className={styles.disclaimer}>
        <p className={`${styles.disclaimerLabel} t-overline`}>Disclaimer</p>
        <p className={`${styles.disclaimerBody} t-body3`}>
          This investigation is not a medical diagnosis. It helps you explore
          possible connections between products and skin reactions.
        </p>
      </section>

      <h1 className={`${styles.question} t-h4-h3`}>
        What is currently happening to your skin?
      </h1>

      <div
        className={styles.chips}
        role="group"
        aria-label="What is currently happening to your skin?"
      >
        {SYMPTOMS.map((s) => (
          <Chip
            key={s}
            label={s}
            selected={selected.includes(s)}
            onToggle={() => setAnswer("start", (prev) => toggleMulti(prev ?? [], s))}
          />
        ))}
      </div>

      {/* "Other" needs a free-text field when chosen — not built yet, so this
          stays a button rather than pretending to be an input. */}
      <button type="button" className={styles.other}>
        <PlusIcon />
        <span className={`${styles.otherLabel} t-body2`}>
          Other – describe in detail
        </span>
      </button>
    </QuestionScreen>
  );
}
