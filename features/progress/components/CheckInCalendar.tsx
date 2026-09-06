/* biome-ignore-all lint/suspicious/noArrayIndexKey: EVERY INDEX KEY IN THIS
   FILE IS A GRID POSITION, WHICH IS THE CELL'S ACTUAL IDENTITY. A month is a
   fixed 7-column table: the weekday header repeats its initials ("S", "T"
   twice) so the value cannot key it, the empty leading and trailing cells have
   no date at all, and rows and cells never reorder or filter — changing month
   replaces the whole grid. Nothing here holds state, so there is no stale-state
   bug for a real key to prevent. Keying the day cells by ISO date and the blanks
   by index would mix two schemes for no gain. */
"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./CheckInCalendar.module.css";
import { DataCard } from "@/components/ui/DataCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import type { CheckIn } from "@/features/progress/progress";
import {
  WEEKDAYS_SUNDAY,
  WEEKDAY_NAMES_SUNDAY,
  addMonths,
  formatFull,
  formatMonth,
  fromIso,
  monthGridSunday,
  sameDay,
  startOfMonth,
  toIso,
} from "@/lib/date";

/**
 * `card · calendar` — Figma 552:1255 (mobile) / 554:1260 (desktop).
 *
 * The month of check-ins: a filled indigo disc on every day checked in, a ring
 * on today, and a legend naming the two.
 *
 * ⚠️ THE DESIGN SYSTEM HAS NO CALENDAR, and the handoff says so outright —
 * "a calendar" is on its missing list alongside a line chart and a stat block,
 * all "composed from tokens on these screens rather than instanced". This is
 * the second hand-built calendar in the app; `DateField` is the other. They are
 * NOT the same component and must not be merged: that one is an interactive
 * Monday-first date PICKER with a roving tabstop, this one is a Sunday-first
 * read-only RECORD. See the note on `monthGridSunday`.
 *
 * ⚠️ A CHECKED-IN DAY IS A LINK; EVERY OTHER DAY IS A PLAIN CELL. The handoff
 * places `Check-in detail` in the Progress section precisely because it is "a
 * historical record opened from the Progress calendar", and that screen now has
 * a route — `/progress/check-in/<iso>`. Only the discs are links: a day with no
 * record has nothing to open, and linking it would send the user to a screen
 * whose entire content is a sentence saying so. The focus ring is the global
 * `outline`, never a box-shadow (non-negotiable 11), and the two states'
 * colours are unchanged — a link here is a change of ELEMENT, not of paint.
 *
 * ⚠️ EVERY WEEK ROW IS 32 TALL. The Figma frames disagree with themselves here:
 * the empty leading/trailing cells are 100-tall frames in both, which drags
 * mobile's week-1 to 39 and desktop's week-1 AND week-6 to 100 while every
 * other row stays 32. That is an auto-layout artefact of an empty frame, not a
 * calendar with two giant rows — and the handoff requires the breakpoints to be
 * clones. A uniform 32 with a 4 gap is what both frames draw everywhere the
 * cells are occupied.
 */
export function CheckInCalendar({
  checkIns,
  today,
  className,
}: {
  checkIns: CheckIn[];
  today: Date;
  className?: string;
}) {
  /* ⚠️ TODAY'S MONTH WINS WHEN IT HAS ANYTHING IN IT, and only then does the
     most recent check-in decide. It used to be the check-in's month outright,
     on the reasoning that landing on an empty month — because the flare started
     last month — shows a calendar with nothing in it. Both halves of that are
     still true, but the demo clock is the real clock now (`demoStart` is
     `today - 15 days`), so the seeded fortnight straddles a month boundary for
     roughly half of every month. Opening on the older month put today's ring —
     the thing the legend names — off in a month the reader had to page to.

     Now the ring is on screen whenever today's month has a disc, which on the
     seeded window is every day but the first two of a month, and the fallback
     still catches the case the old rule was written for. */
  const [view, setView] = useState<Date>(() => {
    const thisMonth = startOfMonth(today);
    const inThisMonth = checkIns.some((c) => {
      const d = fromIso(c.date);
      return d !== null && sameDay(startOfMonth(d), thisMonth);
    });
    if (inThisMonth) return thisMonth;

    const last = checkIns[checkIns.length - 1];
    const lastDate = last ? fromIso(last.date) : null;
    return startOfMonth(lastDate ?? today);
  });

  /* ⚠️ FORWARD PAGING STOPS AT TODAY'S MONTH, AND BACKWARD PAGING DOES NOT.
     The two directions are not symmetrical. A month after this one cannot hold
     a check-in — `demoCheckIns` and `checkInsFor` both clip the future on the
     grounds that you cannot have checked in on a day that has not arrived — so
     › led only into grids that are guaranteed empty, forever, as far as 2099.
     ‹ leads into months that merely HAPPEN to be empty, which is a different
     thing and stays reachable.

     Clamping backward too — at the first check-in's month — was the other
     option and is rejected: in the demo the first check-in is 2 Aug and today
     is the 17th, so both arrows would be dead at rest on the one screen whose
     month paging is worth demonstrating. `disabled` rather than a hidden
     button, so the header keeps its shape and the control keeps announcing
     itself; the fade is the DS's own opacity/disabled (non-negotiable 5). */
  const atLatestMonth = sameDay(view, startOfMonth(today));

  const checkedIn = new Set(checkIns.map((c) => c.date));
  const cells = monthGridSunday(view);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) =>
    cells.slice(i * 7, i * 7 + 7)
  );
  const monthLabel = formatMonth(view);

  return (
    <DataCard className={className} aria-labelledby="calendar-title">
      <div className={styles.header}>
        {/* aria-live so paging the month is announced — the grid below it
            changes wholesale and nothing else says which month you are on. */}
        <h2
          id="calendar-title"
          className={`${styles.month} t-h5`}
          aria-live="polite"
        >
          {monthLabel}
        </h2>
        <div className={styles.arrows}>
          <button
            type="button"
            className={styles.arrow}
            aria-label={`Previous month, ${formatMonth(addMonths(view, -1))}`}
            onClick={() => setView((v) => addMonths(v, -1))}
          >
            <ChevronLeftIcon className={styles.arrowIcon} />
          </button>
          <button
            type="button"
            className={styles.arrow}
            disabled={atLatestMonth}
            aria-label={`Next month, ${formatMonth(addMonths(view, 1))}`}
            onClick={() => setView((v) => addMonths(v, 1))}
          >
            <ChevronRightIcon className={styles.arrowIcon} />
          </button>
        </div>
      </div>

      {/* A real <table>: this is a month of records, and the column a day sits
          in carries meaning that only a header cell can give it. */}
      <table className={styles.grid}>
        <caption className="visually-hidden">
          Check-ins in {monthLabel}
        </caption>
        <thead>
          <tr>
            {WEEKDAYS_SUNDAY.map((initial, i) => (
              <th key={i} scope="col" className={styles.weekdayCell}>
                <span className={`${styles.weekday} t-label-sm`} aria-hidden="true">
                  {initial}
                </span>
                {/* the initials repeat — S/T twice — so "S, M, T, W, T, F, S"
                    read aloud identifies nothing */}
                <span className="visually-hidden">
                  {WEEKDAY_NAMES_SUNDAY[i]}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {week.map((date, d) => {
                if (!date) return <td key={d} className={styles.cell} />;

                const isCheckedIn = checkedIn.has(toIso(date));
                const isToday = sameDay(date, today);

                /* the day's own number is the visible label, so the date and
                   its state carry the accessible name of the link */
                const label = (
                  <>
                    {date.getDate()}
                    {(isCheckedIn || isToday) && (
                      <span className="visually-hidden">
                        {formatFull(date)}
                        {isCheckedIn && " — checked in"}
                        {isToday && " — today"}
                      </span>
                    )}
                  </>
                );

                return (
                  <td key={d} className={styles.cell}>
                    {isCheckedIn ? (
                      <Link
                        href={`/progress/check-in/${toIso(date)}`}
                        className={`${styles.day} t-label-sm`}
                        data-checked-in
                        data-today={isToday || undefined}
                      >
                        {label}
                      </Link>
                    ) : (
                      <span
                        className={`${styles.day} t-label-sm`}
                        data-today={isToday || undefined}
                      >
                        {label}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <p className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.dot} data-checked-in />
          <span className={`${styles.legendLabel} t-label-sm`}>Checked in</span>
        </span>
        <span className={styles.legendItem}>
          <span className={styles.dot} data-today />
          <span className={`${styles.legendLabel} t-label-sm`}>Today</span>
        </span>
      </p>
    </DataCard>
  );
}
