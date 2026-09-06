"use client";

import { useEffect, useState } from "react";
import { sameDay } from "./date";

/**
 * Today's date, as the BROWSER reckons it.
 *
 * ⚠️ THIS EXISTS BECAUSE `new Date()` CANNOT BE CALLED DURING RENDER. The
 * PROGRESS demo used to freeze its clock at 17 Aug 2026 precisely to dodge
 * that, and the freeze is now gone — the calendar rings the real today and the
 * seeded fortnight is measured back from it. Two things break if a component
 * simply calls `new Date()` in its body:
 *
 * 1. **The prerender bakes a date into the HTML.** Every one of these screens
 *    is a client component, which Next still renders on the server. Whatever
 *    date that render sees is what ships in the static HTML.
 * 2. **The server's clock is not the reader's.** A server keeps UTC and the
 *    reader keeps local time, so for some hours of every day the two disagree
 *    about what day it is — and React would hydrate a mismatch.
 *
 * The fix is the ordinary one: the server's own timestamp comes down as a prop
 * so the first client render reproduces the server's HTML exactly, and an
 * effect then corrects to the browser's clock once hydration is done. The
 * `sameDay` guard means the correction re-renders only when the two genuinely
 * disagree — which is the timezone edge, not the common case. The three
 * PROGRESS routes are `force-dynamic` so `serverNow` is the REQUEST time
 * rather than the build time; without that the correction would have to travel
 * however stale the deployment is.
 *
 * ⚠️ IT DOES NOT TICK. A page left open across midnight keeps yesterday's ring
 * until it is navigated or reloaded. A timer would fix it and is deliberately
 * not here: it buys one edge case a lifecycle to get wrong, and every route
 * that shows a date is a click away from a fresh render.
 */
export function useToday(serverNow: number): Date {
  const [today, setToday] = useState<Date>(() => new Date(serverNow));

  useEffect(() => {
    const now = new Date();
    setToday((prev) => (sameDay(prev, now) ? prev : now));
  }, []);

  return today;
}
