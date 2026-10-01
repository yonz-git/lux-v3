"use client";

import { QuestionScreen } from "./QuestionScreen";
import { QuestionPanel } from "./QuestionPanel";
import panel from "./QuestionPanel.module.css";
import { Chip } from "@/components/ui/Chip";
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
 * ⚠️ lux-v3 (1 Oct 2026, the canvas boards): each question is its own glass
 * panel. Skin type keeps its radio ROWS — five long, mutually exclusive
 * descriptions read best as a list. Tendencies became CHIPS, exclusives
 * included and still checkboxes: short labels, zero or more.
 *
 * ⚠️ THE OPENING AI BUBBLE IS GONE — removed 6 Sep 2026, not yet reflected in
 * Figma. "Thanks for sharing that. Let me ask a few questions about your skin
 * first." restated the step's own title and desktop already hid it as padding,
 * so the screen now opens on its first question at both widths.
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

  return (
    <QuestionScreen id="skin-type">
      <QuestionPanel question="Which description fits your skin most often?">
        <div
          className={panel.rows}
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
      </QuestionPanel>

      <QuestionPanel question="Do any of these usually apply?">
        <div
          className={panel.chips}
          role="group"
          aria-label="Do any of these usually apply?"
        >
          {[...TENDENCIES, ...EXCLUSIVES].map((label) => (
            <Chip
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
