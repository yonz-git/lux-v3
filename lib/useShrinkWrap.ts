"use client";

import { type RefObject, useLayoutEffect } from "react";

/** Shrink a block of wrapped text to its longest line. */
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
