"use client";

import { QuestionScreen } from "./QuestionScreen";
import { QuestionPanel } from "./QuestionPanel";
import panel from "./QuestionPanel.module.css";
import { Chip } from "@/components/ui/Chip";
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
 * panel. Tendencies became CHIPS, exclusives included and still checkboxes:
 * short labels, zero or more. Skin type kept radio ROWS until 4 Oct 2026 and
 * is radio CHIPS now — see the note on its group below.
 *
 * ⚠️ THE OPENING AI BUBBLE IS GONE — removed 6 Sep 2026, not yet reflected in
 * Figma. "Thanks for sharing that. Let me ask a few questions about your skin
 * first." restated the step's own title and desktop already hid it as padding,
 * so the screen now opens on its first question at both widths.
 *
 * NOTHING starts selected — the Figma frames show options already chosen
 * because a comp has to show a filled-in state.
 */
const SKIN_TYPES = ["Dry", "Combination", "Oily", "Balanced", "Not sure"];
/* ⚠️ `Redness-prone` ADDED 4 Oct 2026, asked for directly: a lasting trait
   (flushes easily), not a diagnosis (step 3) or what is happening now
   (step 1). Like the other two, nothing in the analysis reads it yet. */
const TENDENCIES = ["Sensitive", "Acne-prone", "Redness-prone"];
const EXCLUSIVES = ["None", "Not sure"];

export function SkinType() {
  const { answers, setAnswer } = useInvestigation();
  const skinType = answers["skin-type"] ?? null;
  const tendencies = answers.tendencies ?? [];

  return (
    <QuestionScreen id="skin-type">
      {/* ⚠️ SHORTENED 4 Oct 2026, asked for directly: the product brief's
          "Which description fits your skin most often?" wrapped to two lines
          on a phone, and so did "Which best describes your skin?" (258 of the
          239 a 375 phone leaves beside the orb). Same question; the brief
          keeps the long wording. */}
      <QuestionPanel question="What's your skin type?">
        {/* ⚠️ PILLS, SINGLE CHOICE — 4 Oct 2026, asked for directly ("they
            could be pills and only single choice"), so the two questions on
            this screen read as one set. NOT IN FIGMA, and it widens the radio
            `Chip`, which AGENTS.md scoped to the check-in's five-point scale:
            a second caller, decided here. It keeps the contract that makes it
            honest: `control="radio"` inside a real `radiogroup`, so a screen
            reader still announces "radio button, 2 of 5", and picking one
            replaces the last. Raise a single-select Chip in Figma. */}
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
