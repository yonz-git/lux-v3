"use client";

import { useEffect } from "react";

/** longer than the longest entrance (the face's, ~1.6s) */
const SETTLE_MS = 2400;

export function MotionObserver() {
  useEffect(() => {
    const html = document.documentElement;
    const seen = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target;
          el.setAttribute("data-inview", "");
          io.unobserve(el);
          /* an entrance that uses keyframes keys them on
             `[data-inview]:not([data-settled])`, so a part mounted LATER (a
             callout drawn on Save) takes its own motion, not the entrance's */
          window.setTimeout(() => el.setAttribute("data-settled", ""), SETTLE_MS);
        }
      },
      { rootMargin: "100000px 0px -15% 0px", threshold: 0 },
    );

    const scan = () => {
      if (!html.hasAttribute("data-store-ready")) return;
      for (const el of document.querySelectorAll("[data-motion]:not([data-inview])")) {
        if (seen.has(el)) continue;
        seen.add(el);
        io.observe(el);
      }
    };

    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    /* the store flag lands on <html> after the first scan can run */
    const ready = new MutationObserver(scan);
    ready.observe(html, { attributes: true, attributeFilter: ["data-store-ready"] });
    scan();

    return () => {
      io.disconnect();
      mo.disconnect();
      ready.disconnect();
    };
  }, []);

  return null;
}
