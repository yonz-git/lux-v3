"use client";

import styles from "./Timing.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { OptionRow } from "@/components/ui/OptionRow";
import { DateField } from "@/components/ui/DateField";
import { useInvestigation } from "@/lib/store/InvestigationProvider";

/**
 * 03c — Timing. Figma mobile 488:851, desktop 491:1031. Step 5/6.
 *
 * ⚠️ THE STATUS GROUP IS RADIO ROWS EVEN THOUGH THE WIREFRAME DREW CHIPS. It is
 * single-select, and the design-system contract is circle = exactly one.
 *
 * ⚠️ A SINGLE-SELECT CHIP NOW EXISTS (`Chip`'s `control="radio"`, added for the
 * daily check-in) — and this screen deliberately does NOT use it. These labels
 * are sentences about state ("Getting worse"), not a short ordinal scale, and
 * the screen already stacks a labelled date field above them, so a pill row
 * here would break the field/label rhythm to save one row of height. Revisit
 * only if Figma resolves the wireframe's pills into a real variant.
 *
 * The date uses `DateField`, not a native <input type="date">: the native popup
 * is drawn by the browser and cannot be styled, so it rendered as a stock white
 * Chrome calendar in the middle of the LUX flow.
 *
 * Both fields are required, so Continue stays disabled until the date and the
 * status are answered.
 */
const STATUS = ["Ongoing", "Improving", "Resolved", "Getting worse"];

export function Timing() {
  const { answers, setAnswer } = useInvestigation();
  const timing = answers.timing ?? {};

  const set = (patch: Partial<typeof timing>) =>
    setAnswer("timing", (prev) => ({ ...(prev ?? {}), ...patch }));

  return (
    <QuestionScreen id="timing">
      {/* ⚠️ AN `<h2>`, NOT AN `<h1>` — the step's own title is the page's one
          `<h1>`, rendered by `QuestionScreen` (visually hidden here). This is a
          question WITHIN that step, so it is a level down. Marking both as
          `<h1>` gave a screen reader two — on `skin-type`, three — peer page
          titles with nothing saying the questions belong to the step. The
          `t-h4-h3` class carries every visual property, so the tag change moves
          nothing on screen. */}
      <h2 className={`${styles.question} t-h4-h3`}>When did this start?</h2>

      <div className={`${styles.field} ${styles.fieldWithPopover}`}>
        <label className="t-label" htmlFor="start-date">
          Approximate start date
        </label>
        <DateField
          id="start-date"
          value={timing.date}
          onChange={(date) => set({ date })}
        />
      </div>

      <div className={styles.field}>
        <p className={`${styles.label} t-label`} id="status-label">
          Current status
        </p>
        <div className={styles.options} role="radiogroup" aria-labelledby="status-label">
          {STATUS.map((o) => (
            <OptionRow
              key={o}
              control="radio"
              label={o}
              selected={timing.status === o}
              onSelect={() => set({ status: o })}
            />
          ))}
        </div>
      </div>
    </QuestionScreen>
  );
}
