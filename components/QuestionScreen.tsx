"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import styles from "./QuestionScreen.module.css";
import { ScreenHeader } from "./ScreenHeader";
import { StepProgress } from "./StepProgress";
import { Button } from "./Button";
import { BottomNav } from "./BottomNav";
import { useInvestigation } from "./InvestigationProvider";
import { type StepId, stepFor, prevHref, nextHref } from "@/lib/flow";

/**
 * The shell every investigation question screen shares.
 *
 * ORDER IS FIXED, top to bottom: header row -> 12px spacer -> progress track ->
 * spacer -> content. The track goes UNDER the header row, never above it.
 *
 * Nav `Active` is `check` on every investigation question — the nav reflects the
 * section the user is IN, and these are check-in/investigation questions.
 *
 * On desktop the content and the Continue button move INSIDE one centred
 * frosted card (`width/card-form`, 920). On mobile there is no card: the content
 * sits on the gradient and Continue is pushed to the bottom by a flex spacer.
 * Continue is full-width on mobile and 280 centred on desktop — verified across
 * all nine GETTING STARTED desktop frames.
 *
 * ⚠️ CONTINUE IS DISABLED UNTIL THE STEP IS ANSWERED. The rule lives on the step
 * in `lib/flow.ts`, not in the screen, so a new screen cannot forget it.
 */
export function QuestionScreen({
  id,
  children,
  continueLabel = "Continue",
  gapBeforeContinue,
}: {
  id: StepId;
  children: ReactNode;
  continueLabel?: string;
  /** desktop-only gap between the content and Continue, in px. Defaults to the
   *  card's own 32; 01 uses 104 because Figma adds an extra spacer there. */
  gapBeforeContinue?: number;
}) {
  const router = useRouter();
  const { answers } = useInvestigation();
  const { step, isComplete } = stepFor(id);
  const next = nextHref(id);
  const canContinue = isComplete(answers);

  return (
    <main className="screen" data-layout="flow">
      <div className={styles.shell} data-reveal>
        <ScreenHeader backHref={prevHref(id)} />

        <div className={styles.progressWrap}>
          <StepProgress step={step} />
        </div>

        <div className={styles.card}>
          {/* keyed on the step so the reveal replays on navigation — React
              reconciles by component type, and every screen renders this same
              QuestionScreen, so without a key the DOM is reused and the
              animation never re-runs. */}
          <div className={styles.content} data-reveal data-reveal-stagger key={id}>
            {children}
          </div>

          <div
            className={styles.spacer}
            aria-hidden="true"
            style={
              gapBeforeContinue
                ? ({ "--continue-gap": `${gapBeforeContinue}px` } as React.CSSProperties)
                : undefined
            }
          />

          {/* width is owned by .continue, not Button's `fullWidth`: both are
              single-class selectors, so `fullWidth` would win or lose on bundle
              order rather than intent. 100% on mobile, 280 centred on desktop. */}
          <Button
            className={styles.continue}
            disabled={!canContinue}
            onClick={() => next && router.push(next)}
          >
            {continueLabel}
          </Button>
        </div>
      </div>

      <BottomNav active="check" />
    </main>
  );
}
