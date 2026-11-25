"use client";

import type { CSSProperties } from "react";
import styles from "./SkinHealth.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { DataCard } from "@/components/ui/DataCard";
import { IconButton } from "@/components/ui/IconButton";
import { Tag } from "@/components/ui/Tag";
import { CountUp } from "@/components/ui/CountUp";
import {
  CheckIcon,
  ChevronRightIcon,
  NoteIcon,
  ProgressIcon,
} from "@/components/ui/icons";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { useToday } from "@/lib/useToday";
import { addDays, daysBetween, formatShort, fromIso } from "@/lib/date";
import { smoothPath } from "@/features/progress/trendPath";
import { ProgressEmpty } from "./ProgressScreen";
import {
  HEALTH_WINDOWS,
  SEVERITY_MAX,
  checkInsFor,
  checkInsSince,
  directionLabel,
  hasInvestigation,
  lastCheckInLabel,
  latestCheckIn,
  progressView,
  severityLabel,
  severityRange,
  trendHeight,
  trendReading,
  windowStart,
} from "@/features/progress/progress";

/**
 * Skin health, at `/myskin/health` — the latest reading over a chosen
 * window: the score with its word and turn 1's direction, the line, the
 * range and the count of check-ins, and the one-line reading. A pushed view
 * of Progress, on the readout surface (DataCard).
 */
export function SkinHealth({ now }: { now: number }) {
  const { answers } = useInvestigation();
  const today = useToday(now);

  if (!hasInvestigation(answers)) return <ProgressEmpty />;

  const view = progressView(answers, today);
  const all = checkInsFor(answers, view);
  const active = HEALTH_WINDOWS[0];
  const from = windowStart(view, active.days);
  const span = Math.max(1, daysBetween(from, view.today));
  const shown = checkInsSince(all, from);
  const latest = latestCheckIn(shown);
  const range = severityRange(shown);
  const reading = trendReading(shown);
  const direction = latest ? directionLabel(latest.direction) : null;
  const daysInWindow = daysBetween(from, view.today) + 1;

  const points = shown.map((c) => {
    const day = fromIso(c.date) ?? view.today;
    return {
      date: c.date,
      x: (daysBetween(from, day) / span) * 100,
      y: (1 - trendHeight(c.severity)) * 100,
    };
  });
  const last = points.at(-1);
  const path =
    points.length > 1 ? smoothPath(points.map((p) => [p.x, p.y])) : null;

  const insight =
    reading ??
    (shown.length === 1
      ? "Check in again tomorrow, your line starts with a second reading."
      : "No check-ins in this range yet.");

  return (
    <HubScreen nav="my-skin" layout="plain">
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className="t-h2">Everything we know about your Skin</h1>
        </header>

        <DataCard
          className={styles.reading}
          aria-labelledby="health-reading"
          /* the score counts up once the card is in view */
          data-motion
        >
          <p id="health-reading" className={`${styles.label} t-label-sm`}>
            <span className={styles.liveDot} aria-hidden="true" />
            {lastCheckInLabel(shown, view.today) ?? "No check-in in this range"}
          </p>

          {latest ? (
            <>
              <p className={styles.score}>
                <CountUp value={latest.severity} className="t-metric1" />
                <span className={`${styles.unit} t-h5`}>/ {SEVERITY_MAX}</span>
              </p>
              <div className={styles.verdict}>
                <p className="t-h6">{severityLabel(latest.severity)}</p>
                {direction && (
                  <Tag
                    variant={
                      latest.direction === "worse" ? "symptom" : "answer"
                    }
                  >
                    {direction}
                  </Tag>
                )}
              </div>
            </>
          ) : (
            <p className={`${styles.none} t-body2`}>
              Your latest reading shows here once you check in.
            </p>
          )}

          <div className={styles.chart} aria-hidden="true">
            <div className={styles.plot}>
              <span
                className={styles.grid}
                style={{ "--x": "0%" } as CSSProperties}
              />
              <span
                className={styles.grid}
                style={{ "--x": "50%" } as CSSProperties}
              />
              <span
                className={styles.grid}
                style={{ "--x": "100%" } as CSSProperties}
              />
              {path && (
                /* keyed by window: a new range is a new line, faded in — a
                   path can only morph into one with as many points */
                <svg
                  key={active.label}
                  className={`${styles.line} reveal-quick`}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  focusable="false"
                  aria-hidden="true"
                >
                  <path
                    d={path}
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
                  style={{ left: `${last.x}%`, top: `${last.y}%` }}
                />
              )}
            </div>
            <div className={`${styles.ticks} t-caption`}>
              <span>{formatShort(from)}</span>
              <span>
                {formatShort(
                  addDays(from, Math.round(daysBetween(from, view.today) / 2)),
                )}
              </span>
              <span>Today</span>
            </div>
          </div>

          <ul className="visually-hidden">
            {shown.map((c) => (
              <li key={c.date}>
                {c.date}: {c.severity} out of {SEVERITY_MAX},{" "}
                {severityLabel(c.severity).toLowerCase()}
              </li>
            ))}
          </ul>
        </DataCard>

        <div className={styles.tiles}>
          <DataCard className={styles.tile}>
            <p className={`${styles.tileLabel} t-label-sm`}>
              <ProgressIcon className={styles.tileIcon} />
              Range
            </p>
            <p className={styles.tileValue}>
              {range ? (
                <>
                  <span className="t-metric2">
                    {range.low === range.high
                      ? range.low
                      : `${range.low}–${range.high}`}
                  </span>
                  <span className={`${styles.unit} t-body2`}>
                    / {SEVERITY_MAX}
                  </span>
                </>
              ) : (
                <span className="t-metric2">–</span>
              )}
            </p>
          </DataCard>

          <DataCard className={styles.tile}>
            <p className={`${styles.tileLabel} t-label-sm`}>
              <CheckIcon className={styles.tileIcon} />
              Days checked in
            </p>
            <p className={styles.tileValue}>
              <span className="t-metric2">{shown.length}</span>
              <span className={`${styles.unit} t-body2`}>/ {daysInWindow}</span>
            </p>
          </DataCard>
        </div>

        <DataCard>
          <div className={styles.insight}>
            <span className={styles.insightIcon} aria-hidden="true">
              <NoteIcon />
            </span>
            <p className={`${styles.insightText} t-body2`}>{insight}</p>
            {latest && (
              <IconButton
                size="md"
                href={`/myskin/check-in/${latest.date}`}
                label="Open the latest check-in"
              >
                <ChevronRightIcon />
              </IconButton>
            )}
          </div>
        </DataCard>
      </div>
    </HubScreen>
  );
}
