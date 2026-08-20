"use client";

import { useRouter } from "next/navigation";
import styles from "./KnownConditions.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { OptionRow } from "./OptionRow";
import { OtherBlock } from "./OtherBlock";
import { useInvestigation } from "./InvestigationProvider";
import { toggleMulti } from "@/lib/answers";
import { nextHref } from "@/lib/flow";

/**
 * 02c — Known conditions. Figma mobile 476:2566, desktop 476:2695. Step 4/8.
 *
 * ⚠️ THIS QUESTION IS OPTIONAL. The screen says so and carries a "Skip this
 * question" link, so Continue is available from the start rather than gated on
 * a selection — the only requirement is that a ticked "Other" is filled in.
 *
 * The question is asked as a HEADING here (H5 + a Body 3 helper), not as an AI
 * bubble the way 02a and 02b ask theirs. Transcribed from Figma as-is; the
 * inconsistency is flagged in the session notes.
 *
 * "None" and "Prefer not to say" are the exclusives on this screen — both stay
 * checkboxes and clear the rest via toggleMulti.
 */
const CONDITIONS = ["Rosacea", "Eczema", "Perioral dermatitis", "Psoriasis"];
const EXCLUSIVES = ["None", "Prefer not to say"];

export function KnownConditions() {
  const router = useRouter();
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

  const next = nextHref("conditions");

  return (
    <QuestionScreen id="conditions">
      <div className={styles.heading}>
        <h1 className="t-h5">Do you have any diagnosed skin conditions?</h1>
        <p className={`${styles.helper} t-body3`}>
          This is optional — skip if you prefer.
        </p>
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

        <hr className={styles.divider} />

        <div className={styles.options}>{EXCLUSIVES.map(row)}</div>
      </div>

      {/* the escape hatch for a genuinely optional question. `Skip` belongs
          inline next to the question — never in the header, where the flow uses
          `Save & exit` instead. */}
      <button
        type="button"
        className={`${styles.skip} t-label`}
        onClick={() => next && router.push(next)}
      >
        Skip this question
      </button>
    </QuestionScreen>
  );
}
