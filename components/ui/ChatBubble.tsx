"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import styles from "./ChatBubble.module.css";

/**
 * Chat bubble — Figma Spec/Chat Bubble (47:12).
 *
 * `from` drives both the fill and which corner carries the 1px tail:
 *   ai   — frosted white-blue, tail TOP-LEFT, sits left
 *   user — soft sage, tail TOP-RIGHT, sits right
 *
 * `align` defaults to the side that matches `from`. Override it only for a
 * centred hero composition such as 00 Welcome.
 *
 * ⚠️ EVERY BUBBLE PLAYS THE WELCOME ENTRANCE. `bubble-enter` (globals.css) is
 * applied here rather than by each screen, so the drop-and-settle that 00
 * Welcome's opening bubble has is what a bubble does everywhere — a screen
 * cannot forget it and cannot invent a second one. Set `entrance={false}` only
 * when the caller supplies its own bubble animation; Welcome does, because its
 * two bubbles swap in place and that timeline already includes the entrance.
 *
 * ⚠️ `size="compact"` IS THE `/chat` PANEL'S BUBBLE AND NOTHING ELSE'S. It
 * takes the text to `Body 3` (14/22) and the padding to 12/16, and it exists
 * because `chat-page / mobile` (270:96) really does draw its bubbles smaller
 * than the spec component does — 14/20 text in a 375 panel. The DEFAULT stays
 * the published spec, so a bubble is `Body 2`/`Body 1` everywhere the product
 * speaks at full size; this is the one surface that does not.
 *
 * ⚠️ RAISE IT IN FIGMA AS A VARIANT ON `Spec/Chat Bubble` before a second
 * caller reaches for it. Right now two Figma sources disagree — the component
 * and the chat frame — and this prop encodes that disagreement rather than
 * settling it. It is a size variant on the published component, NOT a licence
 * for a screen to set its own `font-size`, which rule 3 forbids.
 *
 * ⚠️ Body text is `Body 2` (16/26) on mobile and `Body 1` (18/28) on desktop.
 * This comment claimed as much from the start while the CSS held `t-body2` at
 * both breakpoints, so every desktop bubble rendered 16/26 and came out 2px
 * short per line. Verified against Figma across both sections: 02a/02b/03c and
 * all of PRODUCTS carry `Body 1` on desktop, and a one-line desktop bubble is
 * 56 tall (14 + 28 + 14), not 54.
 *
 * ⚠️ NOT IN FIGMA — `hug` TRIMS A WRAPPED BUBBLE TO ITS LONGEST LINE, asked for
 * directly 13 Sep 2026 on the `/check` landing ("the right extra space doesn't
 * look good"). CSS cannot do this: a box whose text wraps keeps the width it
 * wrapped AT, so a two-line sentence under a 376 ceiling leaves a band of empty
 * fill down the right of every line but the longest. `hug` lets the bubble lay
 * out at its CSS width, measures the widest line box, and pins its width to
 * that plus its own padding. It re-measures when its row resizes (a breakpoint
 * changes the type and the padding too) and once webfonts land. The CSS
 * ceiling still decides where lines BREAK; this only removes the slack after
 * them. The entrance scales the bubble, so line rects are divided back out by
 * the bubble's own rendered/layout ratio. Opt-in, because a conversation's
 * bubbles are left-aligned against a column edge and do not need it.
 */
export function ChatBubble({
  from,
  align,
  full,
  hug,
  size = "default",
  entrance = true,
  className,
  "aria-hidden": ariaHidden,
  children,
}: {
  from: "ai" | "user";
  align?: "left" | "right" | "center";
  /** span the whole content column instead of hugging the text */
  full?: boolean;
  /** trim a wrapped bubble to its longest line — see the note above */
  hug?: boolean;
  /**
   * The bubble's type and padding. `compact` is the `/chat` panel's smaller
   * bubble — see the note above, and raise it in Figma before reusing it.
   */
  size?: "default" | "compact";
  /**
   * Play the standard bubble entrance. Off only for a caller whose own
   * animation covers the arrival — see the note above.
   */
  entrance?: boolean;
  /** applied to the bubble itself, not the row — e.g. an entrance animation */
  className?: string;
  /**
   * Hide the bubble from assistive tech. Only for a bubble whose text is already
   * announced by something else — 00 Welcome marks its question up as the page
   * `<h1>`, so the bubble would otherwise read it out a second time.
   */
  "aria-hidden"?: boolean;
  children: ReactNode;
}) {
  const resolvedAlign = align ?? (from === "ai" ? "left" : "right");
  const bubbleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!hug) return;
    const bubble = bubbleRef.current;
    const text = textRef.current;
    const row = bubble?.parentElement;
    if (!bubble || !text || !row) return;

    const measure = () => {
      /* lay out at the CSS width first, so the lines break where they should */
      bubble.style.removeProperty("width");
      const range = document.createRange();
      range.selectNodeContents(text);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0);
      if (rects.length === 0 || bubble.offsetWidth === 0) return;
      const scale = bubble.getBoundingClientRect().width / bubble.offsetWidth || 1;
      const lineWidth =
        (Math.max(...rects.map((r) => r.right)) - Math.min(...rects.map((r) => r.left))) / scale;
      const cs = getComputedStyle(bubble);
      const inline = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      /* +1 so a subpixel line never re-wraps inside its own trimmed box */
      bubble.style.width = `${Math.ceil(lineWidth + inline) + 1}px`;
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    document.fonts?.ready.then(measure);
    return () => {
      observer.disconnect();
      bubble.style.removeProperty("width");
    };
  }, [hug, children]);

  return (
    <div className={styles.row} data-align={resolvedAlign} aria-hidden={ariaHidden}>
      <div
        ref={bubbleRef}
        className={[
          styles.bubble,
          /* still a `t-*` class either way — rule 3 holds for both sizes */
          size === "compact" ? "t-body3" : "t-body2-body1",
          entrance ? "bubble-enter" : null,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        data-from={from}
        data-full={full ? "true" : undefined}
        data-size={size === "compact" ? "compact" : undefined}
      >
        {/* ⚠️ NOT IN FIGMA — the shine. The text is wrapped so a band of light
            can sweep across it as the bubble lands (`.shine-on-enter`,
            globals.css) without touching the bubble's own fill: the glint is
            a gradient clipped to the glyphs, and the bubble's background is
            already spoken for. It plays for Welcome's bubbles too, keyed to
            their own landing in globals.css, which is why it is not gated on
            `entrance`. `--shine-ink` is set on `.bubble` in the module. */}
        <span ref={textRef} className={`${styles.text} shine-text shine-on-enter`}>
          {children}
        </span>
      </div>
    </div>
  );
}
