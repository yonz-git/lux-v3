"use client";

import styles from "./ObservableSymptoms.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { ChatBubble } from "./ChatBubble";
import { OptionRow } from "./OptionRow";
import { OtherBlock } from "./OtherBlock";
import { useInvestigation } from "./InvestigationProvider";
import { toggleMulti } from "@/lib/answers";

/**
 * 03a — Observable symptoms. Figma mobile 486:785, desktop 490:965. Step 5/8.
 *
 * Ten multi-select options plus an other-block, and NO exclusives — "select all
 * that apply" with no "None", because by this point in the flow the user has
 * already said something is happening to their skin.
 *
 * The tallest mobile screen in the flow (1177 in Figma). Here it simply grows
 * and the page scrolls, rather than being pinned to a canvas height.
 */
const SYMPTOMS = [
  "Redness or change in skin colour",
  "Itching",
  "Burning or stinging",
  "Dryness or tightness",
  "Flaking or scaling",
  "Small rash-like bumps",
  "Whiteheads or pimples",
  "Swelling",
  "Blisters, weeping or crusting",
];

export function ObservableSymptoms() {
  const { answers, setAnswer } = useInvestigation();
  const selected = answers.symptoms ?? [];
  const other = answers.symptomsOther ?? "";

  const toggle = (label: string) =>
    setAnswer("symptoms", (prev) => toggleMulti(prev ?? [], label));

  return (
    <QuestionScreen id="symptoms">
      <ChatBubble from="ai" full>
        Now let&rsquo;s talk about what you noticed. Select all that apply.
      </ChatBubble>

      <div
        className={styles.options}
        role="group"
        aria-label="What have you noticed? Select all that apply."
      >
        {SYMPTOMS.map((label) => (
          <OptionRow
            key={label}
            control="checkbox"
            label={label}
            selected={selected.includes(label)}
            onSelect={() => toggle(label)}
          />
        ))}
        <OtherBlock
          selected={selected.includes("Other")}
          onToggle={() => toggle("Other")}
          value={other}
          onChange={(v) => setAnswer("symptomsOther", v)}
          placeholder="Describe the symptom"
        />
      </div>
    </QuestionScreen>
  );
}
