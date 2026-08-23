"use client";

import styles from "./KnownConditions.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { OptionRow } from "./OptionRow";
import { OtherBlock } from "./OtherBlock";
import { useInvestigation } from "./InvestigationProvider";
import { toggleMulti } from "@/lib/answers";

/**
 * 02c — Known conditions. Figma mobile 476:2566, desktop 476:2695. Step 4/6.
 *
 * ⚠️ THIS QUESTION IS OPTIONAL — Continue is available from the start rather
 * than gated on a selection, the only requirement being that a ticked "Other"
 * is filled in. There is no separate "Skip" control; Continue itself is the
 * skip.
 *
 *
 * "None" is the one exclusive answer on this screen — it stays a checkbox and
 * clears the rest via toggleMulti (it is in `EXCLUSIVE_OPTIONS`, lib/answers.ts).
 */
const CONDITIONS = ["Rosacea", "Eczema", "Perioral dermatitis", "Psoriasis", "None"];

export function KnownConditions() {
  const { answers, setAnswer } = useInvestigation();
  const selected = answers.conditions ?? [];
  const other = answers.conditionsOther ?? "";

  const toggle = (label: string) =>
    setAnswer("conditions", (prev) => toggleMulti(prev ?? [], label));

  const row = (label: string) => (
    <OptionRow
      key={label}
      control="checkbox"
      label={label}
      selected={selected.includes(label)}
      onSelect={() => toggle(label)}
    />
  );

  return (
    <QuestionScreen id="conditions">
      <div className={styles.heading}>
        <h1 className={`${styles.question} t-h4-h3`}>
          Do you have any diagnosed skin conditions?
        </h1>
      </div>

      <div
        className={styles.optionsBlock}
        role="group"
        aria-label="Do you have any diagnosed skin conditions?"
      >
        <div className={styles.options}>
          {CONDITIONS.map(row)}
          <OtherBlock
            selected={selected.includes("Other")}
            onToggle={() => toggle("Other")}
            value={other}
            onChange={(v) => setAnswer("conditionsOther", v)}
            placeholder="Type the condition"
          />
        </div>
      </div>
    </QuestionScreen>
  );
}
