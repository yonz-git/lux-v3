"use client";

import { QuestionScreen } from "./QuestionScreen";
import { QuestionPanel } from "./QuestionPanel";
import panel from "./QuestionPanel.module.css";
import { OtherField } from "./OtherField";
import { Chip } from "@/components/ui/Chip";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { toggleMulti } from "@/lib/store/answers";

/** 02c — Known conditions. Figma mobile 476:2566, desktop 476:2695. Step 4/6. */
export const CONDITIONS = ["Rosacea", "Eczema", "Perioral dermatitis", "Psoriasis", "None", "Other"];

export function KnownConditions() {
  const { answers, setAnswer } = useInvestigation();
  const selected = answers.conditions ?? [];
  const other = answers.conditionsOther ?? "";

  const toggle = (label: string) =>
    setAnswer("conditions", (prev) => toggleMulti(prev ?? [], label));

  return (
    <QuestionScreen id="conditions">
      <QuestionPanel question="Any diagnosed conditions?">
        <div
          className={panel.chips}
          role="group"
          aria-label="Any diagnosed conditions?"
        >
          {CONDITIONS.map((label) => (
            <Chip
              tone="teal"
              key={label}
              label={label}
              selected={selected.includes(label)}
              onToggle={() => toggle(label)}
            />
          ))}
        </div>
        <OtherField
          open={selected.includes("Other")}
          value={other}
          onChange={(v) => setAnswer("conditionsOther", v)}
          onRemove={() => {
            setAnswer("conditionsOther", undefined);
            setAnswer("conditions", (prev) =>
              (prev ?? []).filter((c) => c !== "Other"),
            );
          }}
          placeholder="Type the condition"
        />
      </QuestionPanel>
    </QuestionScreen>
  );
}
