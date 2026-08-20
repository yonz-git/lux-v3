"use client";

import styles from "./SkinTendencies.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { ChatBubble } from "./ChatBubble";
import { OptionRow } from "./OptionRow";
import { useInvestigation } from "./InvestigationProvider";
import { toggleMulti } from "@/lib/answers";

/**
 * 02b — Skin tendencies. Figma mobile 485:755, desktop 489:960. Step 3/8.
 *
 * MULTI-SELECT, so these are Checkbox rows (square = zero or more).
 *
 * ⚠️ "None" and "Not sure" are EXCLUSIVE options — answers about the list rather
 * than items in it. They stay checkboxes and keep role="checkbox" (the group is
 * still multi-select) but they clear everything else. They are separated from
 * the normal options by a divider so the difference is visible before you tap.
 * The clearing logic lives in toggleMulti(), never in the role.
 */
const TENDENCIES = ["Sensitive", "Acne-prone"];
const EXCLUSIVES = ["None", "Not sure"];

export function SkinTendencies() {
  const { answers, setAnswer } = useInvestigation();
  const selected = answers.tendencies ?? [];
  const skinType = answers["skin-type"];

  const row = (label: string) => (
    <OptionRow
      key={label}
      control="checkbox"
      label={label}
      selected={selected.includes(label)}
      onSelect={() =>
        setAnswer("tendencies", (prev) => toggleMulti(prev ?? [], label))
      }
    />
  );

  return (
    <QuestionScreen id="tendencies">
      {/* the comp hardcodes "Combination"; here it echoes the real answer */}
      {skinType && <ChatBubble from="user">{skinType}</ChatBubble>}

      <div className={styles.prompt}>
        <ChatBubble from="ai" full>
          Do any of these usually apply?
        </ChatBubble>
      </div>

      <div className={styles.optionsBlock} role="group" aria-label="Do any of these usually apply?">
        <div className={styles.options}>{TENDENCIES.map(row)}</div>
        <hr className={styles.divider} />
        <div className={styles.options}>{EXCLUSIVES.map(row)}</div>
      </div>
    </QuestionScreen>
  );
}
