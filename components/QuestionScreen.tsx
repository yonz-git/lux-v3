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
  continueWidth = "compact",
  footer,
  onContinue,
  contentGap,
}: {
  id: StepId;
  children: ReactNode;
  continueLabel?: string;
  /** desktop-only gap between the content and Continue, in px. Defaults to the
   *  card's own 32; 01 uses 104 because Figma adds an extra spacer there. */
  gapBeforeContinue?: number;
  /**
   * How wide Continue is ON DESKTOP. `compact` is 280 centred, which is what
   * every GETTING STARTED desktop frame uses.
   *
   * ⚠️ `full` exists because the eight PRODUCTS add-flow desktop frames stretch
   * Continue to the full 824 card width instead — consistently, on all eight.
   * That is a real inconsistency between the two sections in Figma, not a
   * transcription slip, so it is expressed rather than normalised away. Mobile
   * is full-width in both sections.
   */
  continueWidth?: "compact" | "full";
  /**
   * An extra control ABOVE Continue, inside the same footer — `04a — Long-term
   * products · filled` puts a secondary "Done" there. Continue stays the last
   * thing in the footer at both breakpoints.
   */
  footer?: ReactNode;
  /**
   * Run just before Continue navigates — `04 — Confirm product` uses it to
   * commit the product it has been drafting. Kept as a hook on the shell rather
   * than a bespoke button on the screen, so Continue stays the one control that
   * both gates on `isComplete` and moves the flow.
   */
  onContinue?: () => void;
  /**
   * The gap between the progress track and the content, in px. Defaults to 32,
   * which is what every screen that OPENS WITH A CHAT BUBBLE uses. The four
   * PRODUCTS screens that open with a page title use 24 instead — a heading
   * carries its own optical weight, so the comps let it sit closer to the track.
   */
  contentGap?: number;
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

        <div
          className={styles.card}
          style={
            contentGap != null
              ? ({ "--content-gap": `${contentGap}px` } as React.CSSProperties)
              : undefined
          }
        >
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
          <div className={styles.footer} data-width={continueWidth}>
            {footer}
            <Button
              className={styles.continue}
              disabled={!canContinue}
              onClick={() => {
                onContinue?.();
                if (next) router.push(next);
              }}
            >
              {continueLabel}
            </Button>
          </div>
        </div>
      </div>

      <BottomNav active="check" />
    </main>
  );
}
