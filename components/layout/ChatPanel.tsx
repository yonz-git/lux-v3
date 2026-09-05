"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./ChatPanel.module.css";
import { Orb } from "@/components/ui/Orb";
import { CloseIcon } from "@/components/ui/icons";

/**
 * The conversation panel — Figma `chat-page / mobile` (270:96).
 *
 * A surface that floats on `.screen`'s canvas: the orb, a greeting and a close
 * X across the top, a scrolling body, and a caller-supplied footer pinned under
 * it. `/chat` puts its composer in that footer; the daily check-in puts
 * `Submit check-in` there.
 *
 * ⚠️ IT IS IN `components/layout/` BECAUSE TWO SECTIONS USE IT, which is the
 * placement rule exactly: a component used by one section is that section's,
 * and this one stopped being `chat`'s the moment PROGRESS's check-in adopted
 * it. It takes no opinion about what goes inside it — no chat data, no check-in
 * data — so it is the frame around a screen, which is what this folder is for.
 *
 * ⚠️ IT IS A PANEL, NOT A SCREEN, and every measurement follows from that. The
 * frame is 375x538 with a 36 radius on all four corners and its own gradient,
 * where every other frame in the file is the 440x957 canvas. That is also the
 * only reading under which a close control means anything: you collapse a
 * panel, not a page.
 *
 * ⚠️ THE CLOSE CONTROL IS AN X AND THE FRAME DRAWS A CHEVRON-DOWN — decided
 * 5 Sep 2026. A chevron-down is a DISCLOSURE glyph: it says the panel folds
 * away and can be unfolded, and pointed at a route change it promises a state
 * the app cannot return you to. An X says the thing goes away, which is what
 * happens. It is the DS's own `CloseIcon` rather than a panel-local glyph, so
 * it sits on `size/icon-xs` (16) against the frame's off-scale 14.
 *
 * ⚠️ THE X IS THE ONLY WAY OUT, ON EVERY CALLER, AND A `backHref` CHEVRON WAS
 * BUILT AND THEN REMOVED — 5 Sep 2026, both on request. AGENTS.md says a pushed
 * view keeps its back chevron and the daily check-in is one, so the chevron was
 * added beside the orb; walked, it made the header carry two controls that went
 * to the same place. The panel's idiom wins here: you close a panel, and one
 * way out is the whole point of a surface that floats over the app rather than
 * sitting in its navigation stack.
 *
 * ⚠️ SO A PUSHED VIEW IN THIS PANEL HAS NO CHEVRON, WHICH IS A REAL DIVERGENCE
 * FROM THE ROUTE RULES — not an oversight. Re-adding one is a prop and a
 * stylesheet rule; the argument against it is that the X already keeps the
 * promise the chevron would make.
 *
 * ⚠️ THE HEADING IS THE CALLER'S AND IS USUALLY INVISIBLE. `Hi, I'm LUX` is
 * `Body 1` and NOT a page heading — the panel is a surface inside a page and
 * the greeting names the speaker, not the screen. A route that needs an `<h1>`
 * (every route does) passes one through `heading`, which is why the check-in
 * can keep announcing itself as "Daily Check-in" while showing the greeting.
 *
 * ⚠️ NOTHING HERE ANIMATES ITSELF. The panel arrives on the global
 * `[data-reveal]` hook and a bubble inside it runs `ChatBubble`'s own entrance
 * because it is newly mounted. This file names no animation, which is what
 * keeps it clear of the "a rule that NAMES an animation may not live in a CSS
 * module" trap.
 */
export function ChatPanel({
  closeHref,
  closeLabel,
  heading,
  footer,
  bodyProps,
  children,
}: {
  /** where the X goes — the screen's own way out, not a shared destination */
  closeHref: string;
  /** the X's accessible name; it names what closes, so it is per-caller */
  closeLabel: string;
  /**
   * The route's `<h1>`. Render it `visually-hidden` unless the screen really
   * shows a title — see the note above.
   */
  heading?: ReactNode;
  /** pinned under the scrolling body: `/chat`'s composer, check-in's Submit */
  footer?: ReactNode;
  /** forwarded to the scrolling body — a ref, a label, an aria role */
  bodyProps?: React.HTMLAttributes<HTMLDivElement>;
  children: ReactNode;
}) {
  return (
    <div className={styles.panel} data-reveal>
      {heading}

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.avatar}>
            <Orb size="50px" />
          </span>
          <p className="t-body1">Hi, I&rsquo;m LUX</p>
        </div>

        <Link
          href={closeHref}
          className={`${styles.headerButton} ${styles.close}`}
          aria-label={closeLabel}
        >
          <CloseIcon />
        </Link>
      </div>

      <div {...bodyProps} className={styles.body}>
        {children}
      </div>

      {footer}
    </div>
  );
}
