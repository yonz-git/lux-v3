import { useId, type CSSProperties } from "react";
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
 * ⚠️ THE CARD IS `surface/data-deep`, NOT `surface/data` — NOT IN FIGMA, BY
 * EXPLICIT REQUEST, and it is the one place in PROGRESS where SURFACE SYSTEM
 * B's dark ink is deliberately reversed. Non-negotiable 17 darkened
 * `text/on-data` globally because white failed AA on the 44% sage; this card
 * takes the darker 62% sage instead and puts the white back, scoped to itself
 * by redefining the three text tokens on its own element (see the stylesheet —
 * that is what makes it specificity-proof rather than a race with DataCard's
 * own rule). Hierarchy is carried by size and weight, exactly as the
 * non-negotiable says, so all three tokens resolve to the same white.
 *
 * ⚠️ MEASURE IT BEFORE YOU TRUST IT. `surface/data-deep` is translucent, so
 * what white actually sits on is the sage composited over the canvas gradient
 * AT THIS CARD'S POSITION — the measurement is in the stylesheet, and it is the
 * reason this is flagged rather than quietly shipped.
 *
 * ⚠️ THE GRIDLINES AND THE AREA FILL ARE NOT IN FIGMA EITHER. The frame draws
 * three y-axis numbers and a bare line, which reads as figures floating beside
 * a squiggle: the numbers name values that nothing on the plot lines up with.
 * Three rules at 10 / 5 / 0 give them something to be true about, and the
 * baseline is stronger than the two above it because zero is the axis and the
 * others are guides. The area under the line is the same white at 18% fading
 * out — it is what makes a two-pixel stroke read as a QUANTITY rather than a
 * path. Both are chart furniture the DS has no opinion about, because the DS
 * has no chart; raise them with the line chart itself.
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
  /* the area fill's gradient needs a document-unique id — two of these on one
     page would otherwise both resolve to the first one's <defs> */
  const fillId = useId();

  /* x is a plain percentage across the plot; the plot box is inset by the dot's
     radius (see the stylesheet) so the first and last dots sit fully inside the
     card rather than half over its padding. */
  const points = checkIns.map((c, i) => ({
    ...c,
    x: checkIns.length > 1 ? (i / (checkIns.length - 1)) * 100 : 50,
    y: BASELINE_Y - (c.severity / SEVERITY_MAX) * PLOT_SPAN,
  }));

  const labelled = axisLabelIndices(points.length);

  return (
    <DataCard
      className={[styles.card, className].filter(Boolean).join(" ")}
      aria-labelledby="trend-title"
    >
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
          No check-ins yet, your symptom trend appears once you have checked in
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
                <div className={styles.gridlines} />
                {points.length > 1 && (
                  <svg
                    className={styles.line}
                    viewBox="0 0 100 110"
                    preserveAspectRatio="none"
                    focusable="false"
                    aria-hidden="true"
                  >
                    <defs>
                      {/* ⚠️ `gradientUnits` STAYS THE DEFAULT (objectBoundingBox)
                          so the fade follows the polygon's own box however wide
                          the card gets — a userSpaceOnUse gradient would be
                          stretched by preserveAspectRatio along with it. */}
                      <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* closed on the ZERO line (y=102), not on the viewBox floor
                        (110) — the plot's bottom 8px is the y-axis label's half
                        line box, not part of the scale, and filling into it
                        would draw a quantity below zero */}
                    <polygon
                      points={`${points[0].x},${BASELINE_Y} ${points
                        .map((p) => `${p.x},${p.y}`)
                        .join(" ")} ${points[points.length - 1].x},${BASELINE_Y}`}
                      fill={`url(#${fillId})`}
                      stroke="none"
                    />
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

/* Where 0 and 10 land in the 110-tall plot — the y-axis labels are 16-tall boxes
   spread top to bottom, so their centres sit at 8, 55 and 102. Named because
   three things now depend on them: the point mapping, the area fill's closing
   edge, and the gridlines in the stylesheet. ⚠️ CHANGE ONE AND CHANGE THE CSS. */
const BASELINE_Y = 102;
const PLOT_SPAN = 94;

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
