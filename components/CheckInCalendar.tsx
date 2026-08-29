"use client";

import { useState } from "react";
import styles from "./CheckInCalendar.module.css";
import { DataCard } from "./DataCard";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import type { CheckIn } from "@/lib/progress";
import {
  WEEKDAYS_SUNDAY,
  WEEKDAY_NAMES_SUNDAY,
  addMonths,
  formatFull,
  formatMonth,
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
 * ⚠️ THE DAYS ARE NOT INTERACTIVE YET, deliberately. The handoff places
 * `Check-in detail` in the Progress section precisely because it is "a
 * historical record opened from the Progress calendar" — so a day will
 * eventually be a link. That screen has no route, and following `BottomNav`'s
 * rule (a link to a 404 is worse than a control that has not been wired) the
 * discs stay plain cells until it lands. Give a checked-in day an <a> then, and
 * the focus ring is an `outline`, never a box-shadow (non-negotiable 11).
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
  /* Opens on the month with the most recent check-in in it, falling back to
     today's — landing on an empty month because the flare started last month
     would show a calendar with nothing in it. */
  const [view, setView] = useState<Date>(() => {
    const last = checkIns[checkIns.length - 1];
    return startOfMonth(last ? new Date(`${last.date}T00:00:00`) : today);
  });

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

                return (
                  <td key={d} className={styles.cell}>
                    <span
                      className={`${styles.day} t-label-sm`}
                      data-checked-in={isCheckedIn || undefined}
                      data-today={isToday || undefined}
                    >
                      {date.getDate()}
                      {(isCheckedIn || isToday) && (
                        <span className="visually-hidden">
                          {formatFull(date)}
                          {isCheckedIn && " — checked in"}
                          {isToday && " — today"}
                        </span>
                      )}
                    </span>
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
