"use client";

import styles from "./KnownConditions.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { OptionRow } from "@/components/ui/OptionRow";
import { OtherBlock } from "./OtherBlock";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { toggleMulti } from "@/lib/store/answers";

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
        {/* ⚠️ AN `<h2>`, NOT AN `<h1>` — the step's own title is the page's one
            `<h1>`, rendered by `QuestionScreen` (visually hidden here). This is a
            question WITHIN that step, so it is a level down. Marking both as
            `<h1>` gave a screen reader two — on `skin-type`, three — peer page
            titles with nothing saying the questions belong to the step. The
            `t-h4-h3` class carries every visual property, so the tag change moves
            nothing on screen. */}
        <h2 className={`${styles.question} t-h4-h3`}>
          Do you have any diagnosed skin conditions?
        </h2>
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
