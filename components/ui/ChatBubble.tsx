import type { ReactNode } from "react";
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
 */
export function ChatBubble({
  from,
  align,
  full,
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
  return (
    <div className={styles.row} data-align={resolvedAlign} aria-hidden={ariaHidden}>
      <div
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
        {children}
      </div>
    </div>
  );
}
