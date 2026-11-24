"use client";

import { useId, type CSSProperties } from "react";
import styles from "./SymptomTrend.module.css";
import { DataCard } from "@/components/ui/DataCard";
import {
  SEVERITY_MAX,
  TREND_BANDS,
  TREND_DAYS,
  type CheckIn,
  severityLabel,
  trendDays,
  trendEvents,
  trendHeight,
} from "@/features/progress/progress";
import { formatShort, fromIso, sameDay, toIso } from "@/lib/date";
import { smoothPath } from "@/features/progress/trendPath";

export function SymptomTrend({
  checkIns,
  today,
  products,
  className,
}: {
  /** every check-in since the start, oldest first; the pill counts them */
  checkIns: CheckIn[];
  today: Date;
  /** the routine, for the product-start marks — `ownedProducts()` */
  products: readonly { name: string; addedOn: string }[];
  className?: string;
}) {
  const titleId = useId();

  const days = trendDays(today, checkIns);
  const index = new Map(days.map((d, i) => [toIso(d), i]));
  const shown = checkIns.filter((c) => index.has(c.date));
  const events = trendEvents(products, days);

  /* 0..1 across the plot, the window's first day at 0 and its last at 1 */
  const xOf = (iso: string) => (index.get(iso) ?? 0) / (TREND_DAYS - 1);

  const points = shown.map((c) => ({
    ...c,
    x: xOf(c.date),
    y: 1 - trendHeight(c.severity),
  }));
  const last = points.at(-1);

  return (
    <DataCard
      className={[styles.card, "grain", className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
      /* the entrance — see the motion block at the end of the module */
      data-motion
    >
      <div className={styles.head}>
        <h2 id={titleId} className={`${styles.title} t-overline`}>
          Progress
        </h2>
        {checkIns.length > 0 && (
          <span className={`${styles.dayPill} t-label-sm`}>
            {checkIns.length} {checkIns.length === 1 ? "check-in" : "check-ins"}
          </span>
        )}
      </div>


      {points.length === 0 ? (
        <p className={`${styles.empty} t-body3`}>
          No check-ins in the last two weeks, your symptom trend appears once you
          have checked in a few times.
        </p>
      ) : (
        <>
          <div className={styles.chart} aria-hidden="true">
            <div className={styles.bandLabels}>
              {[...TREND_BANDS].reverse().map((b, i) => (
                <span
                  key={b.label}
                  className="t-caption"
                  style={{ "--i": i } as CSSProperties}
                >
                  {b.label}
                </span>
              ))}
            </div>

            <div className={styles.plot}>
              <div className={styles.field}>
                <div className={styles.bands}>
                  <span style={{ "--i": 0 } as CSSProperties} />
                  <span style={{ "--i": 1 } as CSSProperties} />
                  <span style={{ "--i": 2 } as CSSProperties} />
                </div>

                <div className={styles.track}>
                  {points.length > 1 && (
                    <svg
                      className={styles.line}
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      focusable="false"
                      aria-hidden="true"
                    >
                      <path
                        d={smoothPath(points.map((p) => [p.x * 100, p.y * 100]))}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  )}

                  {last && (
                    <span
                      className={styles.dot}
                      style={{ left: `${last.x * 100}%`, top: `${last.y * 100}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.days} aria-hidden="true">
            <span className={`${styles.month} t-caption`}>{monthSpan(days)}</span>
            <div className={styles.dayTrack}>
              {days.map((d, i) => (
                <span
                  key={toIso(d)}
                  className={`${styles.day} t-caption`}
                  data-today={sameDay(d, today) || undefined}
                  style={
                    { left: `${(i / (TREND_DAYS - 1)) * 100}%`, "--i": i } as CSSProperties
                  }
                >
                  {d.getDate()}
                </span>
              ))}
            </div>
          </div>

          <ul className="visually-hidden">
            {shown.map((c) => (
              <li key={c.date}>
                {shortDate(c.date)}: {c.severity} out of {SEVERITY_MAX},{" "}
                {severityLabel(c.severity).toLowerCase()}
              </li>
            ))}
            {events.map((e) => (
              <li key={`${e.date}-${e.name}`}>
                Product added on {shortDate(e.date)}
              </li>
            ))}
          </ul>
        </>
      )}
    </DataCard>
  );
}

/** "Sep", or "Sep–Oct" when the fortnight crosses a month */
function monthSpan(days: Date[]): string {
  const month = (d: Date) => d.toLocaleDateString("en-US", { month: "short" });
  const a = month(days[0]);
  const b = month(days[days.length - 1]);
  return a === b ? a : `${a}–${b}`;
}

/** "Sep 16" */
function shortDate(iso: string): string {
  const d = fromIso(iso);
  return d ? formatShort(d) : "";
}
