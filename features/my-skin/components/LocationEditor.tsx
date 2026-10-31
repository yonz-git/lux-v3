"use client";

import styles from "./LocationEditor.module.css";
import { SymptomPlacer } from "./SymptomPlacer";
import { DateField } from "@/components/ui/DateField";
import { useInvestigation } from "@/lib/store/InvestigationProvider";

/**
 * The controls a `Symptoms and location` card opens under its `Edit`: step 1's
 * own symptom chips and face (`SymptomPlacer`), then the episode's start date.
 * Every tap writes to the store as step 1 does, so the card's `Save` only
 * closes it.
 *
 * ⚠️ ONE EDITOR FOR BOTH CARDS — lifted out of the profile recap on 31 Oct
 * 2026, when PROGRESS's face card took the same `Edit` / `Save` (asked for
 * directly: "add this function to the face diagram sections on progress
 * page", "use reusable component system"). `idPrefix` keeps the date field's
 * id unique per page.
 */
export function LocationEditor({ idPrefix }: { idPrefix: string }) {
  const { answers, setAnswer } = useInvestigation();
  const dateId = `${idPrefix}-start-date`;
  return (
    <div className={styles.editor}>
      <SymptomPlacer />
      <div className={styles.field}>
        <label className={`${styles.label} t-label`} htmlFor={dateId}>
          Started on
        </label>
        <DateField
          id={dateId}
          value={answers.timing?.date}
          onChange={(date) =>
            setAnswer("timing", (prev) => ({ ...(prev ?? {}), date }))
          }
        />
      </div>
    </div>
  );
}
