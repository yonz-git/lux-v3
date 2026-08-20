"use client";

import styles from "./SkinType.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { ChatBubble } from "./ChatBubble";
import { OptionRow } from "./OptionRow";
import { useInvestigation } from "./InvestigationProvider";

/**
 * 02a — Skin type. Figma mobile 484:722, desktop 489:902. Step 2/8.
 *
 * SINGLE-SELECT, so these are Radio rows (circle = exactly one). The wireframe
 * drew pills here; the design system contract wins.
 *
 * On desktop the AI's conversational acknowledgement is dropped and only the
 * user's recap bubble is kept — the acknowledgement is padding, the recap
 * carries state. Mobile keeps both turns.
 *
 * NOTHING starts selected — the Figma frame shows "Combination" chosen because a
 * comp has to show a filled-in state. Continue stays disabled until a choice is
 * made.
 */
const OPTIONS = ["Dry", "Combination", "Oily", "Normal or balanced", "Not sure"];

export function SkinType() {
  const { answers, setAnswer } = useInvestigation();
  const value = answers["skin-type"] ?? null;
  const symptoms = answers.start ?? [];

  return (
    <QuestionScreen id="skin-type">
      {/* the recap echoes what the user actually chose on 01, rather than the
          fixed sentence the comp shows */}
      {symptoms.length > 0 && (
        <ChatBubble from="user">
          I&rsquo;ve been getting {formatList(symptoms).toLowerCase()}.
        </ChatBubble>
      )}

      <div className={styles.acknowledgement}>
        <ChatBubble from="ai">
          Thanks for sharing that. Let me ask a few questions about your skin
          first.
        </ChatBubble>
      </div>

      {/* The question itself is an AI bubble on this screen, unlike 01 where it
          is an H5 heading. Transcribed from Figma as-is — see the note in the
          session report about that inconsistency. */}
      <div className={styles.prompt}>
        <ChatBubble from="ai" full>
          Which description fits your skin most often?
        </ChatBubble>
      </div>

      <div
        className={styles.options}
        role="radiogroup"
        aria-label="Which description fits your skin most often?"
      >
        {OPTIONS.map((o) => (
          <OptionRow
            key={o}
            control="radio"
            label={o}
            selected={value === o}
            onSelect={() => setAnswer("skin-type", o)}
          />
        ))}
      </div>
    </QuestionScreen>
  );
}

/** "Redness, itching and dryness" — the recap reads as a sentence, not a list. */
function formatList(items: string[]): string {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
