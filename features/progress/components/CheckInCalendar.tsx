/* biome-ignore-all lint/suspicious/noArrayIndexKey: EVERY INDEX KEY IN THIS
   FILE IS A GRID POSITION, WHICH IS THE CELL'S ACTUAL IDENTITY. A month is a
   fixed 7-column table: the weekday header repeats its initials ("S", "T"
   twice) so the value cannot key it, the empty leading and trailing cells have
   no date at all, and rows and cells never reorder or filter — changing month
   replaces the whole grid. Nothing here holds state, so there is no stale-state
   bug for a real key to prevent. Keying the day cells by ISO date and the blanks
   by index would mix two schemes for no gain. */
"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./CheckInCalendar.module.css";
import { DataCard } from "@/components/ui/DataCard";
import { IconButton } from "@/components/ui/IconButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import type { CheckIn } from "@/features/progress/progress";
import {
  WEEKDAYS,
  WEEKDAY_NAMES,
  addMonths,
  formatFull,
  formatMonth,
  fromIso,
  monthRecordGrid,
  sameDay,
  startOfMonth,
  toIso,
} from "@/lib/date";
import { useInvestigation } from "@/lib/store/InvestigationProvider";

/** Which month the calendar opens on, given what it has to show. */
function defaultMonth(checkIns: CheckIn[], today: Date): Date {
  const thisMonth = startOfMonth(today);
  const inThisMonth = checkIns.some((c) => {
    const d = fromIso(c.date);
    return d !== null && sameDay(startOfMonth(d), thisMonth);
  });
  if (inThisMonth) return thisMonth;

  const last = checkIns[checkIns.length - 1];
  const lastDate = last ? fromIso(last.date) : null;
  return startOfMonth(lastDate ?? today);
}

/**
 * `card · calendar` — Figma 552:1255 (mobile) / 554:1260 (desktop).
 *
 * The month of check-ins: a filled indigo disc on every day checked in, a ring
 * on today, and a legend naming the two.
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
  const [paged, setPaged] = useState<Date | null>(null);
  const view = paged ?? defaultMonth(checkIns, today);
  const setView = (next: (v: Date) => Date) => setPaged(next(view));

  const atLatestMonth = sameDay(view, startOfMonth(today));

  const checkedIn = new Set(checkIns.map((c) => c.date));
  const { hydrated } = useInvestigation();
  const drawn = useRef<ReadonlySet<string> | null>(null);
  useEffect(() => {
    if (hydrated) drawn.current = checkedIn;
  });
  const cells = monthRecordGrid(view);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) =>
    cells.slice(i * 7, i * 7 + 7)
  );
  const monthLabel = formatMonth(view);

  return (
    <DataCard className={className} aria-labelledby="calendar-title" data-motion>
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
          <IconButton
            variant="plain"
            size="md"
            label={`Previous month, ${formatMonth(addMonths(view, -1))}`}
            onClick={() => setView((v) => addMonths(v, -1))}
          >
            <ChevronLeftIcon className={styles.arrowIcon} />
          </IconButton>
          <IconButton
            variant="plain"
            size="md"
            disabled={atLatestMonth}
            label={`Next month, ${formatMonth(addMonths(view, 1))}`}
            onClick={() => setView((v) => addMonths(v, 1))}
          >
            <ChevronRightIcon className={styles.arrowIcon} />
          </IconButton>
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
            {WEEKDAYS.map((initial, i) => (
              <th key={i} scope="col" className={styles.weekdayCell}>
                <span className={`${styles.weekday} t-label-sm`} aria-hidden="true">
                  {initial}
                </span>
                {/* the initials repeat — T/S twice — so "M, T, W, T, F, S, S"
                    read aloud identifies nothing */}
                <span className="visually-hidden">
                  {WEEKDAY_NAMES[i]}
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
                /* the entrance's order, row by row (module, end) */
                const order = { "--i": w * 7 + d } as CSSProperties;

                const iso = toIso(date);
                const isCheckedIn = checkedIn.has(iso);
                const justChecked =
                  isCheckedIn && drawn.current !== null && !drawn.current.has(iso);
                const isToday = sameDay(date, today);
                const isFuture = date > today && !isToday;

                /* the day's own number is the visible label, so the date and
                   its state carry the accessible name of the link */
                const label = (
                  <>
                    {date.getDate()}
                    {(isCheckedIn || isToday) && (
                      <span className="visually-hidden">
                        {formatFull(date)}
                        {isCheckedIn && ", checked in"}
                        {isToday && ", today"}
                      </span>
                    )}
                  </>
                );

                return (
                  <td
                    key={d}
                    className={styles.cell}
                    style={order}
                    data-disc={isCheckedIn || undefined}
                  >
                    {isCheckedIn ? (
                      <Link
                        href={`/progress/check-in/${iso}`}
                        className={`${styles.day} t-label pressable`}
                        data-checked-in
                        data-just-checked={justChecked || undefined}
                        data-today={isToday || undefined}
                      >
                        {label}
                      </Link>
                    ) : (
                      <span
                        className={`${styles.day} t-body3`}
                        data-today={isToday || undefined}
                        data-future={isFuture || undefined}
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
          <span className={`${styles.legendLabel} t-caption`}>Checked in</span>
        </span>
        <span className={styles.legendItem}>
          <span className={styles.dot} data-today />
          <span className={`${styles.legendLabel} t-caption`}>Today</span>
        </span>
      </p>
    </DataCard>
  );
}
