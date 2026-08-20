"use client";

import { useState } from "react";
import styles from "./StartInvestigation.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { Chip } from "./Chip";
import { PlusIcon } from "./icons";

/**
 * 01 — Start investigation. Figma mobile 476:2542, desktop 476:2670. Step 1/8.
 *
 * Symptoms are CHIPS because they are short multi-select labels — that is the
 * documented use for Chip, and it must not be "normalised" to rows.
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
  // "Redness" starts selected, matching the Figma frame
  const [selected, setSelected] = useState<string[]>(["Redness"]);

  const toggle = (s: string) =>
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  return (
    <QuestionScreen id="start">
      <section className={styles.disclaimer}>
        <p className={`${styles.disclaimerLabel} t-overline`}>Disclaimer</p>
        <p className={`${styles.disclaimerBody} t-body3`}>
          This investigation is not a medical diagnosis. It helps you explore
          possible connections between products and skin reactions.
        </p>
      </section>

      <h1 className={`${styles.question} t-h5`}>
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
            onToggle={() => toggle(s)}
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
