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
 */
export function QuestionScreen({
  id,
  children,
  continueLabel = "Continue",
  gapBeforeContinue,
  gapBeforeContinueMobile,
  footer,
  onContinue,
  contentGap,
  contentGapDesktop,
  nav = "my-skin",
  tightTop,
  contentTop,
}: {
  id: StepId;
  children: ReactNode;
  continueLabel?: string;
  /** desktop-only gap between the content and Continue, in px. Defaults to the
   *  card's own 32; 01 uses 48. It used to pass 104, transcribed from the extra
   *  spacer Figma draws on 476:2670 — that pushed Continue to y 1002 on an
   *  868-tall viewport. Keep any value here on the spacing scale. */
  gapBeforeContinue?: number;
  /** the same gap below 1024, in px. Defaults to 24. */
  gapBeforeContinueMobile?: number;
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
  nav?: NavSection;
  /** take the screen's top padding 40 -> 32, as the hub screens do */
  tightTop?: boolean;
  /**
   * The screen's top padding at every width, in px, through `--content-top`
   * (globals.css) — a flow screen's default is 24. Step 1 passes 8.
   */
  contentTop?: number;
}) {
  const router = useRouter();
  const { answers } = useInvestigation();
  const { step, isComplete, title } = stepFor(id);
  const next = nextHref(id);
  const canContinue = isComplete(answers);

  return (
    <main
      className="screen"
      data-layout="flow"
      data-tight-top={tightTop || undefined}
      style={
        contentTop != null
          ? ({ "--content-top": `${contentTop}px` } as React.CSSProperties)
          : undefined
      }
    >
      <div className={styles.shell} data-reveal>
        <ScreenHeader backHref={prevHref(id)} />

        <div className={styles.progressWrap}>
          <StepProgress step={step} />
        </div>

        <div
          className={styles.card}
          data-reveal
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
                id === "start"
                  ? "visually-hidden"
                  : `${styles.title} t-h4-h3`
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
              {
                ...(gapBeforeContinue && { "--continue-gap": `${gapBeforeContinue}px` }),
                ...(gapBeforeContinueMobile && {
                  "--continue-gap-mobile": `${gapBeforeContinueMobile}px`,
                }),
              } as React.CSSProperties
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
