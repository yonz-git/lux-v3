"use client";

import { useState } from "react";
import styles from "./SkinType.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { ChatBubble } from "./ChatBubble";
import { OptionRow } from "./OptionRow";

/**
 * 02a — Skin type. Figma mobile 484:722, desktop 489:902. Step 2/8.
 *
 * SINGLE-SELECT, so these are Radio rows (circle = exactly one). The wireframe
 * drew pills here; the design system contract wins.
 *
 * On desktop the AI's conversational acknowledgement is dropped and only the
 * user's recap bubble is kept — the acknowledgement is padding, the recap
 * carries state. Mobile keeps both turns.
 */
const OPTIONS = ["Dry", "Combination", "Oily", "Normal or balanced", "Not sure"];

export function SkinType() {
  const [value, setValue] = useState<string | null>("Combination");

  return (
    <QuestionScreen id="skin-type" continueDisabled={value === null}>
      <ChatBubble from="user">
        I&rsquo;ve been getting red, itchy patches on my cheeks for about a week.
      </ChatBubble>

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
            onSelect={() => setValue(o)}
          />
        ))}
      </div>
    </QuestionScreen>
  );
}
