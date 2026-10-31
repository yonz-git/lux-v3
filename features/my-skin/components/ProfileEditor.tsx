"use client";

import { useId } from "react";
import styles from "./ProfileEditor.module.css";
import { OtherField } from "./OtherField";
import { SKIN_TYPES, TENDENCIES, EXCLUSIVES } from "./SkinType";
import { CONDITIONS } from "./KnownConditions";
import { STATUS } from "./Timing";
import { Chip } from "@/components/ui/Chip";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { toggleMulti } from "@/lib/store/answers";

/**
 * The profile recap's editor for the four answers in its `Skin profile` card —
 * skin type, tendencies, known conditions and the symptoms' state (steps 2, 3
 * and 4). 29 Oct 2026, usability testing: the recap read the answers back and
 * offered no way to change one.
 *
 * ⚠️ THE SAME CHIPS AS THE STEPS, THE SAME LISTS — they are imported from the
 * step screens, so an option added there appears here, and `toggleMulti` keeps
 * `None` / `Not sure` exclusive. ⚠️ NOTHING IS SAVED ON A BUTTON: each tap
 * writes to the store as it is made (as step 1 does since the same day), so the
 * card above updates live and `Done` only closes this.
 */
export function ProfileEditor() {
  const { answers, setAnswer } = useInvestigation();
  const ids = { skin: useId(), tend: useId(), cond: useId(), state: useId() };
  const tendencies = answers.tendencies ?? [];
  const conditions = answers.conditions ?? [];

  return (
    <div className={styles.editor}>
      <div className={styles.group}>
        <p id={ids.skin} className={`${styles.label} t-label`}>Skin type</p>
        <div className={styles.chips} role="radiogroup" aria-labelledby={ids.skin}>
          {SKIN_TYPES.map((o) => (
            <Chip
              tone="teal"
              key={o}
              control="radio"
              label={o}
              selected={answers["skin-type"] === o}
              onToggle={() => setAnswer("skin-type", o)}
            />
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <p id={ids.tend} className={`${styles.label} t-label`}>Tendencies</p>
        <div className={styles.chips} role="group" aria-labelledby={ids.tend}>
          {[...TENDENCIES, ...EXCLUSIVES].map((o) => (
            <Chip
              tone="teal"
              key={o}
              label={o}
              selected={tendencies.includes(o)}
              onToggle={() =>
                setAnswer("tendencies", (prev) => toggleMulti(prev ?? [], o))
              }
            />
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <p id={ids.cond} className={`${styles.label} t-label`}>Known conditions</p>
        <div className={styles.chips} role="group" aria-labelledby={ids.cond}>
          {CONDITIONS.map((o) => (
            <Chip
              tone="teal"
              key={o}
              label={o}
              selected={conditions.includes(o)}
              onToggle={() =>
                setAnswer("conditions", (prev) => toggleMulti(prev ?? [], o))
              }
            />
          ))}
        </div>
        <OtherField
          open={conditions.includes("Other")}
          value={answers.conditionsOther ?? ""}
          onChange={(v) => setAnswer("conditionsOther", v)}
          onRemove={() => {
            setAnswer("conditionsOther", undefined);
            setAnswer("conditions", (prev) =>
              (prev ?? []).filter((c) => c !== "Other"),
            );
          }}
          placeholder="Type the condition"
        />
      </div>

      <div className={styles.group}>
        <p id={ids.state} className={`${styles.label} t-label`}>Symptoms state</p>
        <div className={styles.chips} role="radiogroup" aria-labelledby={ids.state}>
          {STATUS.map((o) => (
            <Chip
              tone="teal"
              key={o}
              control="radio"
              label={o}
              selected={answers.timing?.status === o}
              onToggle={() =>
                setAnswer("timing", (prev) => ({ ...(prev ?? {}), status: o }))
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
