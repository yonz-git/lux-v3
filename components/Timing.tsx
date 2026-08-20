"use client";

import styles from "./Timing.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { ChatBubble } from "./ChatBubble";
import { OptionRow } from "./OptionRow";
import { useInvestigation } from "./InvestigationProvider";

/**
 * 03c — Timing. Figma mobile 488:851, desktop 491:1031. Step 7/8.
 *
 * ⚠️ BOTH GROUPS ARE RADIO ROWS EVEN THOUGH THE WIREFRAME DREW CHIPS. Each is
 * single-select, and the design-system contract is circle = exactly one. The
 * library has no single-select Chip variant; adding one is the alternative if
 * the pill look is ever wanted back.
 *
 * The date uses a native <input type="date"> rather than a bespoke picker: the
 * Figma `date-field` is a hand-composed frame, and a real date input gives the
 * prototype a working calendar and correct mobile keyboards for free.
 *
 * All three fields are required, so Continue stays disabled until the date, the
 * onset and the status are all answered.
 */
const ONSET = [
  "Minutes/hours",
  "Next day",
  "2–3 days later",
  "More than 3 days later",
  "Not sure",
];
const STATUS = ["Ongoing", "Improving", "Resolved", "Getting worse"];

export function Timing() {
  const { answers, setAnswer } = useInvestigation();
  const timing = answers.timing ?? {};

  const set = (patch: Partial<typeof timing>) =>
    setAnswer("timing", (prev) => ({ ...(prev ?? {}), ...patch }));

  return (
    <QuestionScreen id="timing">
      <ChatBubble from="ai" full>
        When did this start and how quickly did it appear?
      </ChatBubble>

      <div className={styles.field}>
        <label className="t-label" htmlFor="start-date">
          Approximate start date
        </label>
        <input
          id="start-date"
          type="date"
          className={`${styles.date} t-body2`}
          value={timing.date ?? ""}
          onChange={(e) => set({ date: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <p className={`${styles.label} t-label`} id="onset-label">
          How quickly did symptoms appear?
        </p>
        <div className={styles.options} role="radiogroup" aria-labelledby="onset-label">
          {ONSET.map((o) => (
            <OptionRow
              key={o}
              control="radio"
              label={o}
              selected={timing.onset === o}
              onSelect={() => set({ onset: o })}
            />
          ))}
        </div>
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
