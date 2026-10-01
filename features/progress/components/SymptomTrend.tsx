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
  trendReading,
} from "@/features/progress/progress";
import { formatShort, fromIso, sameDay, toIso } from "@/lib/date";

/**
 * The symptom trend — TREND C, lux-v3 (1 Oct 2026), picked on the design canvas
 * ("Trend C — Bands and events") with two asks: every day labelled, and the
 * mild / moderate / severe bands equally spaced.
 *
 * An overline, a one-line reading ("From moderate to mild in 10 days"), then
 * the chart: three equal bands named down the left, a 2px indigo line through
 * the check-ins of the last fortnight ending on a ringed dot, a dashed line
 * and a pill where a product started, and every day of the window under it,
 * today in indigo. `progress.ts` owns the bands, the window, the reading and
 * the events; this file only draws them.
 *
 * ⚠️ v2's TEAL MESH, WHITE INK — the card was the 30% panel with dark ink
 * for the first build, and took v2's background back the same day, asked for
 * directly ("keep the design and use the bg color of v2"). The layout is
 * Trend C's; the fill, the grain and the white ink are v2's. See the block at
 * the end of the module.
 *
 * ⚠️ X IS THE CALENDAR, NOT THE CHECK-IN COUNT. Each of the 14 days has its
 * place whether or not it holds a check-in, so a gap in the record is a gap on
 * the chart, and the line joins the days that do. Every day is its number;
 * the months the window spans are named at the left ("Sep–Oct").
 *
 * ⚠️ THE LINE STRETCHES, THE DOT MUST NOT. The plot is an SVG with
 * `preserveAspectRatio="none"` and a non-scaling stroke so it fills any card
 * width; the end dot, the event lines and every label are positioned elements,
 * so they stay round and sharp at every width.
 *
 * ⚠️ THE OVERLINE SAYS "Symptoms", NOT A SYMPTOM. The board read "Redness", but
 * a check-in records one severity for the skin as a whole; naming one symptom
 * would claim a series LUX does not keep.
 *
 * The chart is hidden from assistive tech; the reading states the trend and a
 * visually-hidden list gives every check-in and every product start.
 */
export function SymptomTrend({
  checkIns,
  today,
  products,
  day,
  className,
}: {
  checkIns: CheckIn[];
  today: Date;
  /** the routine, for the product-start marks — `ownedProducts()` */
  products: readonly { name: string; addedOn: string }[];
  /**
   * Which day of the investigation today is — `Day 16`, a quiet pill at the
   * title's right end. Asked for directly 15 Sep 2026 ("the day 16 pill
   * should be on top right of the trend graph"); kept through the redesign.
   */
  day?: number;
  className?: string;
}) {
  const titleId = useId();

  const days = trendDays(today);
  const index = new Map(days.map((d, i) => [toIso(d), i]));
  const shown = checkIns.filter((c) => index.has(c.date));
  const reading = trendReading(shown);
  const events = trendEvents(products, days);
  const latest = events.at(-1);

  /* 0..1 across the plot, the first day at 0 and today at 1 */
  const xOf = (iso: string) => (index.get(iso) ?? 0) / (TREND_DAYS - 1);

  const points = shown.map((c) => ({
    ...c,
    x: xOf(c.date),
    y: 1 - trendHeight(c.severity),
  }));
  const last = points.at(-1);

  return (
    <DataCard
      className={[styles.card, className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
      /* the entrance — see the motion block at the end of the module */
      data-motion
    >
      <div className={styles.head}>
        <h2 id={titleId} className={`${styles.title} t-overline`}>
          Symptoms · last {TREND_DAYS} days
        </h2>
        {day !== undefined && (
          <span className={`${styles.dayPill} t-label-sm`}>
            Day {day}
            <span className="visually-hidden"> of your investigation</span>
          </span>
        )}
      </div>

      {reading && <p className={`${styles.reading} t-h5`}>{reading}</p>}

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
              {latest && (
                <span
                  className={`${styles.eventPill} t-label-sm`}
                  style={pillStyle(xOf(latest.date))}
                >
                  {latest.name} · {shortDate(latest.date)}
                </span>
              )}

              <div className={styles.field}>
                <div className={styles.bands}>
                  <span style={{ "--i": 0 } as CSSProperties} />
                  <span style={{ "--i": 1 } as CSSProperties} />
                  <span style={{ "--i": 2 } as CSSProperties} />
                </div>

                <div className={styles.track}>
                  {events.map((e) => (
                    <span
                      key={`${e.date}-${e.name}`}
                      className={styles.eventLine}
                      style={{ left: `${xOf(e.date) * 100}%` }}
                    />
                  ))}

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
                {e.name} added on {shortDate(e.date)}
              </li>
            ))}
          </ul>
        </>
      )}
    </DataCard>
  );
}

/** A smooth line through the points, each segment eased with horizontal
 *  control points so it never overshoots a band. */
function smoothPath(pts: [number, number][]): string {
  return pts
    .map(([x, y], i) => {
      if (i === 0) return `M${x} ${y}`;
      const [x0, y0] = pts[i - 1];
      const dx = (x - x0) / 2;
      return `C${x0 + dx} ${y0} ${x - dx} ${y} ${x} ${y}`;
    })
    .join(" ");
}

/** The pill centres on its line, and holds to the plot's edge near either end
 *  rather than hanging off the card. */
function pillStyle(x: number): CSSProperties {
  if (x < 0.25) return { left: 0 };
  if (x > 0.75) return { right: 0 };
  return { left: `${x * 100}%`, transform: "translateX(-50%)" };
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
