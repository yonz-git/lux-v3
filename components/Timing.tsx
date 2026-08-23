"use client";

import styles from "./Timing.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { OptionRow } from "./OptionRow";
import { DateField } from "./DateField";
import { useInvestigation } from "./InvestigationProvider";

/**
 * 03c — Timing. Figma mobile 488:851, desktop 491:1031. Step 5/6.
 *
 * ⚠️ THE STATUS GROUP IS RADIO ROWS EVEN THOUGH THE WIREFRAME DREW CHIPS. It is
 * single-select, and the design-system contract is circle = exactly one. The
 * library has no single-select Chip variant; adding one is the alternative if
 * the pill look is ever wanted back.
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
      <h1 className={`${styles.question} t-h4-h3`}>When did this start?</h1>

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
