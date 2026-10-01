"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * A number that counts up to its value the first time it is on screen — the
 * 21st.dev statistics cards' move, asked for directly 1 Oct 2026 for the
 * compatibility results (the score in each ring, the analysis summary).
 *
 * ⚠️ THE TRUE VALUE IS ALWAYS IN THE DOM FOR ASSISTIVE TECH. The counting
 * figure is `aria-hidden`; the real number sits beside it, visually hidden,
 * so a screen reader never hears "0" or a figure mid-count.
 *
 * ⚠️ NO FLASH. The server renders the final value; before the first paint
 * (`useLayoutEffect`) it drops to 0 unless the reader asked for reduced
 * motion, then counts once: with its `[data-motion]` card when it has one, or when a
 * fifth of it is visible. `--ease-standard`'s
 * shape (fast, then settling) over `duration`.
 */
export function CountUp({
  value,
  duration = 900,
  delay = 0,
  className,
}: {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  const [armed, setArmed] = useState(false);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShown(0);
    setArmed(true);
  }, []);

  useEffect(() => {
    /* not armed = reduced motion, or the server render: the value as is */
    if (!armed) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let timer = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - t) ** 3;
        setShown(Math.round(value * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      timer = window.setTimeout(run, delay);
    };
    /* ⚠️ INSIDE AN ENTRANCE, COUNT WITH IT. A number in a `[data-motion]`
       card starts when the card is marked (`MotionObserver`), so it counts
       in step with its ring rather than on its own visibility, which could
       run it out early while the card was still held hidden. */
    const host = el.closest("[data-motion]");
    let mo: MutationObserver | undefined;
    let io: IntersectionObserver | undefined;
    if (host) {
      if (host.hasAttribute("data-inview")) start();
      else {
        mo = new MutationObserver(() => {
          if (!host.hasAttribute("data-inview")) return;
          mo?.disconnect();
          start();
        });
        mo.observe(host, { attributes: true, attributeFilter: ["data-inview"] });
      }
    } else {
      io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          io?.disconnect();
          start();
        },
        { threshold: 0.2 },
      );
      io.observe(el);
    }
    return () => {
      mo?.disconnect();
      io?.disconnect();
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [armed, value, duration, delay]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">
        {armed ? shown : value}
      </span>
      <span className="visually-hidden">{value}</span>
    </span>
  );
}
