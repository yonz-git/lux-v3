"use client";

import styles from "./SkinType.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { OptionRow } from "@/components/ui/OptionRow";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { toggleMulti } from "@/lib/store/answers";

/**
 * 02a+02b combined — Skin type and Skin tendencies on one screen. Step 2/5.
 *
 * ⚠️ THIS IS A PROTOTYPE-ONLY MERGE, NOT YET REFLECTED IN FIGMA. The two
 * questions were separate frames (02a `484:722`/`489:902` and 02b
 * `485:755`/`489:960`); per the "Figma first" rule this combination needs a
 * matching Figma frame before it is really done. Both frame ids are kept below
 * so the next person can find what each half came from.
 *
 * Skin type is SINGLE-SELECT (radio, circle = exactly one). Tendencies is
 * MULTI-SELECT (checkbox, square = zero or more) — "None" and "Not sure" are
 * exclusive answers about the list rather than items in it, so they stay
 * checkboxes but clear every other tendency when picked; see toggleMulti().
 *
 * Continue stays disabled until BOTH questions are answered.
 *
 * NOTHING starts selected — the Figma frames show options already chosen
 * because a comp has to show a filled-in state.
 */
const SKIN_TYPES = ["Dry", "Combination", "Oily", "Normal or balanced", "Not sure"];
const TENDENCIES = ["Sensitive", "Acne-prone"];
const EXCLUSIVES = ["None", "Not sure"];

export function SkinType() {
  const { answers, setAnswer } = useInvestigation();
  const skinType = answers["skin-type"] ?? null;
  const tendencies = answers.tendencies ?? [];

  const tendencyRow = (label: string) => (
    <OptionRow
      key={label}
      control="checkbox"
      label={label}
      selected={tendencies.includes(label)}
      onSelect={() =>
        setAnswer("tendencies", (prev) => toggleMulti(prev ?? [], label))
      }
    />
  );

  return (
    <QuestionScreen id="skin-type">
      <div className={styles.acknowledgement}>
        <ChatBubble from="ai">
          Thanks for sharing that. Let me ask a few questions about your skin
          first.
        </ChatBubble>
      </div>

      {/* ⚠️ AN `<h2>`, NOT AN `<h1>` — the step's own title is the page's one
          `<h1>`, rendered by `QuestionScreen` (visually hidden here). This is a
          question WITHIN that step, so it is a level down. Marking both as
          `<h1>` gave a screen reader two — on `skin-type`, three — peer page
          titles with nothing saying the questions belong to the step. The
          `t-h4-h3` class carries every visual property, so the tag change moves
          nothing on screen. */}
      <h2 className={`${styles.prompt} ${styles.question} t-h4-h3`}>
        Which description fits your skin most often?
      </h2>

      <div
        className={styles.typeOptions}
        role="radiogroup"
        aria-label="Which description fits your skin most often?"
      >
        {SKIN_TYPES.map((o) => (
          <OptionRow
            key={o}
            control="radio"
            label={o}
            selected={skinType === o}
            onSelect={() => setAnswer("skin-type", o)}
          />
        ))}
      </div>

      <h2 className={`${styles.prompt} ${styles.tendenciesPrompt} ${styles.question} t-h4-h3`}>
        Do any of these usually apply?
      </h2>

      <div
        className={styles.optionsBlock}
        role="group"
        aria-label="Do any of these usually apply?"
      >
        <div className={styles.tendencyOptions}>{TENDENCIES.map(tendencyRow)}</div>
        <hr className={styles.divider} />
        <div className={styles.tendencyOptions}>{EXCLUSIVES.map(tendencyRow)}</div>
      </div>
    </QuestionScreen>
  );
}
