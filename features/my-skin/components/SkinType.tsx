"use client";

import { QuestionScreen } from "./QuestionScreen";
import { QuestionPanel } from "./QuestionPanel";
import panel from "./QuestionPanel.module.css";
import { Chip } from "@/components/ui/Chip";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { toggleMulti } from "@/lib/store/answers";

/** 02a+02b combined — Skin type and Skin tendencies on one screen. Step 2/5. */
export const SKIN_TYPES = ["Dry", "Combination", "Oily", "Balanced", "Not sure"];
export const TENDENCIES = ["Sensitive", "Acne-prone", "Redness-prone"];
export const EXCLUSIVES = ["None", "Not sure"];

export function SkinType() {
  const { answers, setAnswer } = useInvestigation();
  const skinType = answers["skin-type"] ?? null;
  const tendencies = answers.tendencies ?? [];

  return (
    <QuestionScreen id="skin-type">
      <QuestionPanel question="What's your skin type?">
        <div
          className={panel.chips}
          role="radiogroup"
          aria-label="What's your skin type?"
        >
          {SKIN_TYPES.map((o) => (
            <Chip
              tone="teal"
              key={o}
              control="radio"
              label={o}
              selected={skinType === o}
              onToggle={() => setAnswer("skin-type", o)}
            />
          ))}
        </div>
      </QuestionPanel>

      <QuestionPanel question="Do any of these apply?">
        <div
          className={panel.chips}
          role="group"
          aria-label="Do any of these apply?"
        >
          {[...TENDENCIES, ...EXCLUSIVES].map((label) => (
            <Chip
              tone="teal"
              key={label}
              label={label}
              selected={tendencies.includes(label)}
              onToggle={() =>
                setAnswer("tendencies", (prev) => toggleMulti(prev ?? [], label))
              }
            />
          ))}
        </div>
      </QuestionPanel>
    </QuestionScreen>
  );
}
