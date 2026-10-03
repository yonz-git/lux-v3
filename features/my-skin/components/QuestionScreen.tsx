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
 * ⚠️ lux-v3 (1 Oct 2026, from the canvas boards): every question sits in its
 * own glass panel (`QuestionPanel`), so there is no card round the content at
 * either breakpoint — a frosted card round frosted panels doubles the frost.
 * The column is the phone's on mobile and `width/card-focus` (640) on desktop.
 * Continue follows the content 24 below rather than being pushed to the
 * bottom: full width on mobile, `width/action` centred on desktop.
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
  nav = "my-skin",
  tightTop,
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
   * Which bottom-nav item lights up. Defaults to `my-skin`, the section the
   * investigation flow lives in; step 5 passes `products`. See the note above.
   */
  nav?: NavSection;
  /** take the screen's top padding 40 -> 32, as the hub screens do */
  tightTop?: boolean;
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
    >
      <div className={styles.shell} data-reveal>
        <ScreenHeader backHref={prevHref(id)} />

        <div className={styles.progressWrap}>
          <StepProgress step={step} />
        </div>

        <div
          className={styles.card}
          /* ⚠️ `data-reveal` ON THE CARD, 15 Sep 2026: the shell reveals the
             card and the card's `content` reveals its blocks, so the first
             block rose twice — once inside the card's own rise. A revealed
             container inside a revealed container does not fade itself
             (globals.css), so this stops the card's rise and lets its
             children carry the entrance: the blocks in order, then Continue
             (`.footer`'s delay in the module). */
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
            {/* ⚠️ EVERY STEP SHOWS ITS TITLE, CENTRED — lux-v3, 1 Oct 2026, from
                the canvas ("center"). Until then only step 5 showed it and the
                other four hid the same `<h1>`; the question itself now sits in
                each screen's panel as an `<h2>`. The string comes from the
                step, so a new screen cannot forget it. */}
            {/* ⚠️ EXCEPT STEP 1, 3 Oct 2026, asked for directly (struck through
                on the screen): `Create skin profile` sat over the question
                that already says what the screen is. It stays as the page's
                `<h1>` for screen readers, visually hidden, so the outline and
                the route announcer are unchanged. */}
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
