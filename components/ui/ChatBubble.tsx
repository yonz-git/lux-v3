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
  hug?: boolean;
  /** `hero`: the orb's line on Welcome and `/analyses`, and the check-in's
   *  turns, with airier lines */
  size?: "default" | "compact" | "hero";
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

  /* biome-ignore lint/correctness/useExhaustiveDependencies: `children` IS
     LOAD-BEARING AND THE RULE CANNOT SEE IT. The body reaches the text through
     `textRef` and a Range, never through the prop, so Biome reads the dep as
     surplus. It is the trigger for new text: the observer watches the row,
     whose width is the column's, so text that wraps to the same number of lines
     leaves the row the same size and nothing fires — and `fonts.ready` resolves
     once. Drop it and the bubble keeps the width pinned for the OLD text: slack
     after a shorter line, or lines breaking at that width instead of the CSS
     ceiling. Element children are a new object on every parent render, so they
     re-measure each time; that is a layout read before paint, not a flicker. */
  useLayoutEffect(() => {
    if (!hug) return;
    const bubble = bubbleRef.current;
    const text = textRef.current;
    const row = bubble?.parentElement;
    if (!bubble || !text || !row) return;

    const measure = () => {
      /* lay out at the CSS width first, so the lines break where they should */
      bubble.style.removeProperty("width");
      /* TEXT NODES ONLY: a range over the wrapper's contents also returns the
         box of every child ELEMENT, and a block child (a written line, as on
         `/analyses`) reports the full content width, so the trim came out wider
         than the text */
      const rects: DOMRect[] = [];
      const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) if (r.width > 0) rects.push(r);
      }
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
          size === "compact" ? "t-body3" : "t-body2",
          entrance ? "bubble-enter" : null,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        data-from={from}
        data-full={full ? "true" : undefined}
        data-size={size === "default" ? undefined : size}
      >
        <span ref={textRef} className={`${styles.text} shine-text shine-on-enter`}>
          {children}
        </span>
      </div>
    </div>
  );
}
