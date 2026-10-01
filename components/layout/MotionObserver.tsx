"use client";

import { useEffect } from "react";

/**
 * THE ENTRANCE TRIGGER — lux-v3, 1 Oct 2026, asked for directly ("I want the
 * face diagram, symptom graph, the calendar, the gallery, the compatibility
 * analysis results appear with motions", after 21st.dev's donut and line
 * charts: segments and lines draw in, then points and labels follow).
 *
 * Marks every `[data-motion]` element with `data-inview` the first time its
 * top is 15% up the screen (or it has already been scrolled past), and never unmarks it — a card scrolled past and
 * back does not replay. Each component's own module holds the motion itself,
 * as transitions keyed on the attribute:
 *
 *   .card:not([data-inview]) .line { clip-path: inset(0 100% 0 0); }
 *
 * so there are no `@keyframes` (the CSS Modules localisation trap does not
 * arise) and `prefers-reduced-motion` is already handled by the global
 * duration collapse.
 *
 * ⚠️ NOTHING IS MARKED BEFORE `data-store-ready`. Until then `.screen`'s
 * content is `visibility: hidden` (globals.css) and an IntersectionObserver
 * is geometry-only — it would fire on the hidden cards and every entrance
 * would run unseen on a reload.
 *
 * ⚠️ IT WATCHES THE DOM, NOT ONE ROUTE. A client navigation mounts new cards,
 * and `/progress` renders the gallery card twice (desktop and phone), so every
 * match is observed as it appears. Mounted once in `app/layout.tsx`.
 */
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
      /* ⚠️ THE ROOT REACHES FAR ABOVE THE SCREEN. A fast fling or a jump to
         an anchor can carry a card from below the viewport to above it
         without it ever intersecting, and an IntersectionObserver only
         reports a crossing — so that card stayed hidden for good. With the
         root extended upward, anything already scrolled past counts as seen
         (its entrance runs off-screen, harmlessly). Below, a card starts
         once its top is 15% clear of the bottom edge. */
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
