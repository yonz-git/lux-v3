"use client";

import { QuestionScreen } from "./QuestionScreen";
import { QuestionPanel } from "./QuestionPanel";
import panel from "./QuestionPanel.module.css";
import { OtherField } from "./OtherField";
import { Chip } from "@/components/ui/Chip";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { toggleMulti } from "@/lib/store/answers";

/**
 * 02c — Known conditions. Figma mobile 476:2566, desktop 476:2695. Step 4/6.
 *
 * ⚠️ THIS QUESTION IS OPTIONAL — Continue is available from the start rather
 * than gated on a selection, the only requirement being that a ticked "Other"
 * is filled in. There is no separate "Skip" control; Continue itself is the
 * skip.
 *
 *
 * "None" is the one exclusive answer on this screen — it stays a checkbox and
 * clears the rest via toggleMulti (it is in `EXCLUSIVE_OPTIONS`, lib/answers.ts).
 *
 * ⚠️ lux-v3 (1 Oct 2026, the canvas boards): the answers are CHIPS in one glass
 * panel, `Other` among them, and the field `Other` opens sits under the group.
 */
const CONDITIONS = ["Rosacea", "Eczema", "Perioral dermatitis", "Psoriasis", "None", "Other"];

export function KnownConditions() {
  const { answers, setAnswer } = useInvestigation();
  const selected = answers.conditions ?? [];
  const other = answers.conditionsOther ?? "";

  const toggle = (label: string) =>
    setAnswer("conditions", (prev) => toggleMulti(prev ?? [], label));

  return (
    <QuestionScreen id="conditions">
      <QuestionPanel question="Do you have any diagnosed skin conditions?">
        <div
          className={panel.chips}
          role="group"
          aria-label="Do you have any diagnosed skin conditions?"
        >
          {CONDITIONS.map((label) => (
            <Chip
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
          placeholder="Type the condition"
        />
      </QuestionPanel>
    </QuestionScreen>
  );
}
