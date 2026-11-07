"use client";

import { useEffect } from "react";

/**
 * Smooths wheel scrolling — the page's, and every scroll container inside it.
 * Mounted once in `app/layout.tsx`. Nothing renders.
 */

/* ~120ms time constant: a notch is most of the way there in ~200ms and fully
   settled by ~600ms. Longer reads as floaty; shorter is back to jumping. */
const TAU = 120;
/* close enough to land on the target and stop */
const SETTLE_PX = 0.5;
/* how far a scroller may sit from what this last wrote before it counts as
   someone else's scroll — engines round fractional writes to device pixels */
const DRIFT_PX = 2;
/* `deltaMode` 1 is lines — a Firefox mouse wheel. 16 is one line of body. */
const LINE_PX = 16;

/* one scroller's glide: where it is headed, where the ease has got to, and
   what was last written — the drift check compares against that */
type Glide = { target: number; current: number; written: number };

export function SmoothScroll() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    /* `html` in every engine this ships to — treated as one more scroller, so
       the page and a tray run the same arithmetic */
    const page = document.scrollingElement ?? document.documentElement;

    const glides = new Map<Element, Glide>();
    let raf = 0;
    let last = 0;

    const maxScroll = (el: Element) =>
      Math.max(el.scrollHeight - el.clientHeight, 0);

    const locked = () =>
      getComputedStyle(document.documentElement).overflowY === "hidden" ||
      getComputedStyle(document.body).overflowY === "hidden";

    /* measured from where a glide is HEADED, not where it has got to — a notch
       landing mid-glide adds to the destination */
    const canMove = (el: Element, dy: number) => {
      const at = glides.get(el)?.target ?? el.scrollTop;
      return dy > 0 ? at < maxScroll(el) - 1 : at > 1;
    };

    /* which scroller a wheel over `node` moves — see "TAKING THE EVENT" above.
       `null` hands the event back to the browser. */
    const scrollerFor = (node: EventTarget | null, dy: number) => {
      let el = node instanceof Element ? node : null;
      while (el && el !== document.body && el !== page) {
        const style = getComputedStyle(el);
        if (
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight
        ) {
          if (canMove(el, dy) || glides.has(el)) return el;
          if (style.overscrollBehaviorY !== "auto") return null;
        }
        el = el.parentElement;
      }
      if (locked()) return null;
      return canMove(page, dy) || glides.has(page) ? page : null;
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      glides.clear();
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 16.7;
      last = now;

      for (const [el, glide] of glides) {
        /* unmounted (a tray closed mid-glide), locked (a modal opened
           mid-glide) or moved by something else — dropped where it is */
        if (
          !el.isConnected ||
          (el === page && locked()) ||
          Math.abs(el.scrollTop - glide.written) > DRIFT_PX
        ) {
          glides.delete(el);
          continue;
        }

        /* the content can get shorter mid-glide — a notice collapsing, a row
           leaving the tray — so the target is re-clamped every frame, not only
           when it was set */
        glide.target = Math.min(Math.max(glide.target, 0), maxScroll(el));
        glide.current +=
          (glide.target - glide.current) * (1 - Math.exp(-dt / TAU));

        const done = Math.abs(glide.target - glide.current) < SETTLE_PX;
        if (done) glide.current = glide.target;

        el.scrollTop = glide.current;
        glide.written = el.scrollTop;

        if (done) glides.delete(el);
      }

      if (glides.size > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        last = 0;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey) return;
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      if (motion.matches) return;

      const el = scrollerFor(e.target, e.deltaY);
      if (!el) return;

      const delta =
        e.deltaMode === 1
          ? e.deltaY * LINE_PX
          : e.deltaMode === 2
            ? e.deltaY * el.clientHeight
            : e.deltaY;

      e.preventDefault();

      let glide = glides.get(el);
      if (!glide || Math.abs(el.scrollTop - glide.written) > DRIFT_PX) {
        /* starting fresh — whatever moved it since its last glide is where
           this one starts from */
        const at = el.scrollTop;
        glide = { target: at, current: at, written: at };
        glides.set(el, glide);
      }

      const heading = glide.target - glide.current;
      if (heading !== 0 && Math.sign(heading) !== Math.sign(delta)) {
        glide.target = glide.current;
      }
      glide.target = Math.min(Math.max(glide.target + delta, 0), maxScroll(el));
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /* back/forward restores its own position; do not glide the old one onto it.
       A forward navigation's scroll-to-top is the drift check's to catch. */
    const onPop = () => stop();

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("popstate", onPop);

    return () => {
      stop();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  return null;
}
