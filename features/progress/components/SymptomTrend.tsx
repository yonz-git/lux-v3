import type { CSSProperties } from "react";
import styles from "./SymptomTrend.module.css";
import { DataCard } from "@/components/ui/DataCard";
import { SEVERITY_MAX, type CheckIn, trendSummary } from "@/features/progress/progress";
import { fromIso } from "@/lib/date";

/**
 * `card · symptom trend` — Figma 553:1239 (mobile) / 554:1412 (desktop).
 *
 * Reported severity over the check-ins so far: a white line through white dots,
 * a 10/5/0 y-axis, a date per point along the bottom, and a sentence naming the
 * direction.
 *
 * ⚠️ THE DESIGN SYSTEM HAS NO LINE CHART — it is on the handoff's missing list,
 * and this is composed from tokens like the calendar beside it.
 *
 * ⚠️ IT IS DRAWN FROM THE DATA, NOT EXPORTED AS AN ASSET. The Figma frames hold
 * the line as one baked vector and the points as five ellipses at fixed
 * coordinates, which is the right thing in a comp and the wrong thing here: the
 * number of check-ins and the severity of each are the whole content of this
 * card, so a fixed picture would be a lie the moment the series changed.
 * Reproducing the comp's geometry from the plotted values instead:
 *
 *   The plot band is 110 tall, and the three y-axis labels are 16-tall boxes
 *   spread top-to-bottom. Their CENTRES therefore sit at 8, 55 and 102, which
 *   is where 10, 5 and 0 belong — so a value maps to `102 - (v / 10) * 94`.
 *   Checks out against the comp: its top point plots at 8.9, i.e. y = 18, and
 *   the first ellipse is at y = 14 with a height of 8 — centre 18. ✓
 *
 * ⚠️ THE LINE STRETCHES, THE DOTS MUST NOT. The card is fluid (392 mobile, 616
 * desktop), so the plot is an SVG with `preserveAspectRatio="none"` — which
 * would also stretch a circle into an ellipse and thicken the stroke
 * unevenly. The stroke is protected with `vector-effect="non-scaling-stroke"`,
 * and the dots are NOT in the SVG at all: they are positioned elements, so they
 * stay round at every width. The desktop comp shows what happens otherwise —
 * its "circles" are exported at 13.33 x 8.
 */
export function SymptomTrend({
  checkIns,
  className,
}: {
  checkIns: CheckIn[];
  className?: string;
}) {
  const summary = trendSummary(checkIns);

  /* x is a plain percentage across the plot; the plot box is inset by the dot's
     radius (see the stylesheet) so the first and last dots sit fully inside the
     card rather than half over its padding. */
  const points = checkIns.map((c, i) => ({
    ...c,
    x: checkIns.length > 1 ? (i / (checkIns.length - 1)) * 100 : 50,
    y: 102 - (c.severity / SEVERITY_MAX) * 94,
  }));

  const labelled = axisLabelIndices(points.length);

  return (
    <DataCard className={className} aria-labelledby="trend-title">
      <h2 id="trend-title" className={`${styles.title} t-h5`}>
        Symptom Trend
      </h2>

      {points.length === 0 ? (
        /* ⚠️ NOT IN FIGMA — there is no empty variant of this card. The comp
           only draws a populated chart, but a user who has started an
           investigation and not yet checked in reaches this screen with an
           empty series, and an axis with no line reads as broken. One line of
           on-data-secondary body copy, the same treatment the summary gets. */
        <p className={`${styles.empty} t-body3`}>
          No check-ins yet — your symptom trend appears once you have checked in
          a few times.
        </p>
      ) : (
        <>
          <div className={styles.chart}>
            <div className={styles.yAxis} aria-hidden="true">
              <span className="t-caption">{SEVERITY_MAX}</span>
              <span className="t-caption">{SEVERITY_MAX / 2}</span>
              <span className="t-caption">0</span>
            </div>

            {/* The chart itself is decorative to assistive tech — the sentence
                below states the trend, and the per-point figures follow it in a
                visually-hidden list, which is far more use than a traversable
                <svg>. */}
            <div className={styles.canvas} aria-hidden="true">
              <div className={styles.plot}>
                {points.length > 1 && (
                  <svg
                    className={styles.line}
                    viewBox="0 0 100 110"
                    preserveAspectRatio="none"
                    focusable="false"
                    aria-hidden="true"
                  >
                    <polyline
                      points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                )}
                {points.map((p) => (
                  <span
                    key={p.date}
                    className={styles.point}
                    style={{ left: `${p.x}%`, top: `${p.y}px` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <p className={styles.xAxis} aria-hidden="true">
            {points.map((p, i) =>
              labelled.has(i) ? (
                <span
                  key={p.date}
                  className={`${styles.xLabel} t-caption`}
                  style={xLabelStyle(i, points.length, p.x)}
                >
                  {shortDate(p.date)}
                </span>
              ) : null
            )}
          </p>

          <ul className="visually-hidden">
            {points.map((p) => (
              <li key={p.date}>
                {shortDate(p.date)}: {p.severity} out of {SEVERITY_MAX}
              </li>
            ))}
          </ul>
        </>
      )}

      {summary && <p className={`${styles.summary} t-body3`}>{summary}</p>}
    </DataCard>
  );
}

/**
 * ⚠️ THE AXIS LABELS AT MOST FIVE DATES, WHATEVER THE SERIES DOES — first,
 * last, and evenly spaced between. NOT IN FIGMA, because the comp has exactly
 * five points and never had to decide.
 *
 * The chart plots a point per check-in, and the seeded demo went from five
 * check-ins to eleven (see `DEMO_OFFSETS`) — a real fortnight of daily
 * check-ins is more like fifteen. A label per point does not survive that: at
 * 440 the plot is about 316 wide and "Aug 16" sets at roughly 38, so eleven
 * labels want 418 in 316 and `space-between` simply runs them into each other.
 * A date axis is read for its RANGE and its direction; it does not need to name
 * every point, and the per-point figures are in the visually-hidden list above
 * for anyone who does.
 *
 * Five is the comp's own count, and it is the mobile budget — 316 / 5 leaves
 * about 25 of air between labels. Desktop is 532 wide and could carry ten, but
 * the breakpoints have to be clones, so both get five.
 */
const MAX_X_LABELS = 5;

function axisLabelIndices(count: number): Set<number> {
  if (count <= MAX_X_LABELS) {
    return new Set(Array.from({ length: count }, (_, i) => i));
  }

  const step = (count - 1) / (MAX_X_LABELS - 1);
  return new Set(
    Array.from({ length: MAX_X_LABELS }, (_, i) => Math.round(i * step))
  );
}

/**
 * Each label is centred on its own dot, except the two ends.
 *
 * ⚠️ THIS USED TO BE `justify-content: space-between`, which aligned only
 * because every point was labelled — drop one and flex redistributes the rest,
 * so a label would sit over a dot it does not name. Positioning each one at the
 * SAME `x` the dot uses makes the alignment a fact rather than a coincidence.
 * The first and last are flushed to the plot's edges instead of centred, which
 * is what `space-between` did for them and what the comp draws; centring them
 * would hang half of each outside the card.
 */
function xLabelStyle(
  i: number,
  count: number,
  x: number
): CSSProperties {
  if (i === 0) return { left: 0 };
  if (i === count - 1) return { right: 0 };
  return { left: `${x}%`, transform: "translateX(-50%)" };
}

/** "Aug 2" — the comp's x-axis format. */
function shortDate(iso: string): string {
  const d = fromIso(iso);
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
