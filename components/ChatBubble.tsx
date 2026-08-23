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
  className,
  "aria-hidden": ariaHidden,
  children,
}: {
  from: "ai" | "user";
  align?: "left" | "right" | "center";
  /** span the whole content column instead of hugging the text */
  full?: boolean;
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
        className={[styles.bubble, "t-body2-body1", className].filter(Boolean).join(" ")}
        data-from={from}
        data-full={full ? "true" : undefined}
      >
        {children}
      </div>
    </div>
  );
}
