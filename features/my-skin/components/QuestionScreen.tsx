"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import styles from "./QuestionScreen.module.css";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { StepProgress } from "./StepProgress";
import { Button } from "@/components/ui/Button";
import { BottomNav, type NavSection } from "@/components/layout/BottomNav";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { type StepId, stepFor, prevHref, nextHref } from "@/features/my-skin/flow";

/**
 * The shell every investigation question screen shares.
 *
 * ORDER IS FIXED, top to bottom: header row -> 12px spacer -> progress track ->
 * spacer -> content. The track goes UNDER the header row, never above it.
 *
 * Nav `Active` defaults to `my-skin` — the nav reflects the section the user is
 * IN, and these questions ARE the skin profile.
 *
 * ⚠️ STEP 5 OVERRIDES IT TO `products`, AND IT IS THE ONE STEP THAT SHOULD.
 * `/investigation/products` is the last step of the profile, but what it puts
 * on screen IS the products list — the same list `/products` owns — and the
 * user arrives at it to add products. Lighting `My skin` there names the flow
 * the screen belongs to while the screen itself is plainly Products. Hence the
 * `nav` prop: every other step keeps the default.
 *
 * ⚠️ IT USED TO BE `check`, WHICH WAS THE WRONG SECTION. There was no nav item
 * for the flow at all, so all six of its screens lit the Check tab — the
 * compatibility check, a section none of them belong to and whose own landing
 * cannot reach them. `My skin` is that missing item; see `BottomNav.tsx`.
 *
 * On desktop the content and the Continue button move INSIDE one centred
 * frosted card (`width/card-form`, 920). On mobile there is no card: the content
 * sits on the gradient and Continue is pushed to the bottom by a flex spacer.
 * Continue is full-width on mobile and 280 centred on desktop, on every
 * investigation screen — GETTING STARTED and PRODUCTS add-flow alike.
 *
 * ⚠️ CONTINUE IS DISABLED UNTIL THE STEP IS ANSWERED. The rule lives on the step
 * in `lib/flow.ts`, not in the screen, so a new screen cannot forget it.
 */
export function QuestionScreen({
  id,
  children,
  continueLabel = "Continue",
  gapBeforeContinue,
  footer,
  onContinue,
  contentGap,
  contentGapDesktop,
  titleVisible,
  nav = "my-skin",
}: {
  id: StepId;
  children: ReactNode;
  continueLabel?: string;
  /** desktop-only gap between the content and Continue, in px. Defaults to the
   *  card's own 32; 01 uses 48. It used to pass 104, transcribed from the extra
   *  spacer Figma draws on 476:2670 — that pushed Continue to y 1002 on an
   *  868-tall viewport. Keep any value here on the spacing scale. */
  gapBeforeContinue?: number;
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
  /**
   * The same gap at desktop, in px. Defaults to 40, which every desktop frame
   * draws between the track and the 920 card. Separate from `contentGap`
   * because the two breakpoints are different compositions — mobile's number
   * comes straight off the comp, while on desktop the card is an object
   * floating in a page that is mostly whitespace.
   */
  contentGapDesktop?: number;
  /**
   * Render the step's title as visible copy instead of visually-hidden.
   *
   * ⚠️ EVERY SCREEN GETS AN `<h1>` EITHER WAY — the four PRODUCTS screens that
   * show a title just show the same string the others hide. Before this there
   * was no heading on any flow screen at all: the question lives in a chat
   * bubble, which is a div, so a screen-reader user had nothing to navigate by.
   * The string comes from the step, so a new screen cannot forget it.
   */
  titleVisible?: boolean;
  /**
   * Which bottom-nav item lights up. Defaults to `my-skin`, the section the
   * investigation flow lives in; step 5 passes `products`. See the note above.
   */
  nav?: NavSection;
}) {
  const router = useRouter();
  const { answers } = useInvestigation();
  const { step, isComplete, title } = stepFor(id);
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
            contentGap != null || contentGapDesktop != null
              ? ({
                  ...(contentGap != null && { "--content-gap": `${contentGap}px` }),
                  ...(contentGapDesktop != null && {
                    "--content-gap-desktop": `${contentGapDesktop}px`,
                  }),
                } as React.CSSProperties)
              : undefined
          }
        >
          {/* keyed on the step so the reveal replays on navigation — React
              reconciles by component type, and every screen renders this same
              QuestionScreen, so without a key the DOM is reused and the
              animation never re-runs. */}
          <div className={styles.content} data-reveal data-reveal-stagger key={id}>
            <h1
              className={
                titleVisible ? `${styles.title} t-h4-h3` : "visually-hidden"
              }
            >
              {title}
            </h1>
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
          <div className={styles.footer}>
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

      <BottomNav active={nav} />
    </main>
  );
}
