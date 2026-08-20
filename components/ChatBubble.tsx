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
 * Body text is `Body 2` on mobile and `Body 1` on desktop.
 */
export function ChatBubble({
  from,
  align,
  full,
  children,
}: {
  from: "ai" | "user";
  align?: "left" | "right" | "center";
  /** span the whole content column instead of hugging the text */
  full?: boolean;
  children: ReactNode;
}) {
  const resolvedAlign = align ?? (from === "ai" ? "left" : "right");
  return (
    <div className={styles.row} data-align={resolvedAlign}>
      <div
        className={`${styles.bubble} t-body2`}
        data-from={from}
        data-full={full ? "true" : undefined}
      >
        {children}
      </div>
    </div>
  );
}
