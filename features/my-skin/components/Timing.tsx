"use client";

import styles from "./Timing.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { QuestionPanel } from "./QuestionPanel";
import panel from "./QuestionPanel.module.css";
import { Chip } from "@/components/ui/Chip";
import { DateField } from "@/components/ui/DateField";
import { useInvestigation } from "@/lib/store/InvestigationProvider";

/** 03c — Timing. Figma mobile 488:851, desktop 491:1031. Step 5/6. */
export const STATUS = ["Ongoing", "Improving", "Resolved", "Getting worse"];

export function Timing() {
  const { answers, setAnswer } = useInvestigation();
  const timing = answers.timing ?? {};

  const set = (patch: Partial<typeof timing>) =>
    setAnswer("timing", (prev) => ({ ...(prev ?? {}), ...patch }));

  return (
    <QuestionScreen id="timing">
      <QuestionPanel question="When did this start?" className={styles.panel}>
        <div className={styles.field}>
          <label className={`${styles.label} t-label`} htmlFor="start-date">
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
          <div
            className={styles.status}
            role="radiogroup"
            aria-labelledby="status-label"
          >
            {STATUS.map((o) => (
              <Chip
              tone="teal"
                key={o}
                control="radio"
                label={o}
                selected={timing.status === o}
                onToggle={() => set({ status: o })}
              />
            ))}
          </div>
        </div>
      </QuestionPanel>
    </QuestionScreen>
  );
}
