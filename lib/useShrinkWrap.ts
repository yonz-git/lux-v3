"use client";

import { type RefObject, useLayoutEffect } from "react";

/**
 * Shrink a block of wrapped text to its longest line.
 *
 * ⚠️ CSS CANNOT DO THIS. A box whose text wraps is as wide as its container
 * allows, not as wide as its longest line, so a `fit-content` bubble keeps a
 * strip of empty space down its right edge — asked to be trimmed directly,
 * 1 Oct 2026, on `Analysis results`. This measures the text's own line boxes
 * (a `Range` over the element's contents), sets the element's width to the
 * widest one, and does it again whenever the element's container resizes.
 * The width is cleared before each measure so the text can re-wrap first.
 */
export function useShrinkWrap(
  ref: RefObject<HTMLElement | null>,
  /** the text being wrapped — a change re-measures */
  text: string,
) {
  useLayoutEffect(() => {
    void text;
    const el = ref.current;
    if (!el?.parentElement) return;
    const measure = () => {
      el.style.width = "";
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = [...range.getClientRects()];
      if (rects.length === 0) return;
      const left = Math.min(...rects.map((r) => r.left));
      const right = Math.max(...rects.map((r) => r.right));
      el.style.width = `${Math.ceil(right - left)}px`;
    };
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el.parentElement.parentElement ?? el.parentElement);
    return () => ro.disconnect();
  }, [ref, text]);
}
