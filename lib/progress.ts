/**
 * What the PROGRESS section reads.
 *
 * Figma `Progress — empty` (551:1196 / 551:1231) and `Progress — active`
 * (552:1236 / 554:1252), documented by `HANDOFF — INVESTIGATION & PROGRESS`
 * (559:1376).
 *
 * ⚠️ THE CHECK-IN HISTORY IS A PLACEHOLDER, AND IT HAS TO BE. The Progress
 * screens are READOUTS of daily check-ins — the calendar marks the days you
 * checked in and the chart plots the severity you reported. Those check-ins are
 * written by the CHECK section, which is not built (its nav item is still inert
 * in `BottomNav`, and `Check-in chat` has no route). So there is no real series
 * to read, and the alternative to seeding one is a screen that renders an empty
 * calendar and a chart with no line — which shows nothing about whether the
 * design works.
 *
 * The seed is anchored to a start date and clipped at today, and everything the
 * screen states about it — the day count, the percentage, "3 days ago" — is
 * computed from the series rather than transcribed from the comp, so the screen
 * stays internally consistent whatever date it runs from. That start date is the
 * user's own answer once they have given one, and the fixed demo date until
 * then; see THE DEMO INVESTIGATION below for why `/progress` opens populated.
 * Every entry point is named `demo*` so nothing mistakes them for a data layer.
 * Delete them the moment CHECK writes real check-ins.
 */
import type { Answers } from "./answers";
import { DEMO_PROFILE, skinProfile } from "./demo";
import { type IsoDate, daysBetween, fromIso, toIso } from "./date";

/** One recorded check-in. `severity` is the reported symptom score, 0–10. */
export type CheckIn = { date: IsoDate; severity: number };

/** The chart's y-axis runs 0–10, and the comp labels 10 / 5 / 0. */
export const SEVERITY_MAX = 10;

/**
 * When the investigation started — step 4's flare date, or null if unanswered.
 *
 * The start date is the one answer the Progress screen genuinely cannot work
 * without: the calendar has no month to open on, the profile has no "Started …"
 * line and the chart has no baseline. Skin type and symptoms are echoed when
 * present and guarded when not, the way every other screen treats them.
 */
export function investigationStart(a: Answers): Date | null {
  return a.timing?.date ? fromIso(a.timing.date) : null;
}

/* ---------------------------------------------------------------------------
   THE DEMO INVESTIGATION

   ⚠️ `/progress` SHOWS THE POPULATED DASHBOARD BY DEFAULT, and that is a
   deliberate exception to "the prototype starts EMPTY". That rule is about
   SELECTION CONTROLS on question screens — a comp shows options already ticked
   and the prototype must not, because the user does the selecting. Nothing here
   is a control. Progress is a READOUT, and a readout with nothing in it
   demonstrates nothing: opening the app on `No active investigation` shows a
   hiring manager an empty state, not the design. So an investigation is assumed
   until the user starts a real one, at which point their own answers take over
   completely — walk the flow and the profile, dates and trend are all theirs.
   `Progress — empty` is still built and still reachable, at `/progress/empty`.

   ⚠️ THE DEMO CLOCK IS FIXED, AND NOT `new Date()`. Two reasons.

   1. Correctness. This branch renders during SSR — it is what an unanswered
      store produces, so it is what gets prerendered. `new Date()` there bakes
      the BUILD date into static HTML and then disagrees with the client on
      hydration. Frozen dates make the whole demo path a pure function of
      nothing, so it prerenders safely and never mismatches. The real-answer
      branch may call `new Date()` freely: it is unreachable until the user has
      answered step 4, which can only happen client-side.
   2. Fidelity. Anchored to 2 Aug 2026 the seeded offsets land on Aug 2, 5, 9,
      11 and 14 — exactly the x-axis the comp draws — under an "August 2026"
      calendar header, exactly the comp's. A relative clock would drift off
      both.

   The cost is that the ringed "today" is a fixed day rather than the real one.
   For a prototype whose calendar is mock data either way, matching the design
   deterministically is worth more. To make it track the real clock instead,
   return `new Date()` from `demoToday()` and `demoStart()` becomes
   `today - 15 days` — nothing else changes, but see reason 1 first.
   -------------------------------------------------------------------------- */

/* The seeded profile lives in lib/demo.ts — PROGRESS and CHECK share it, so the
   demo cannot claim two different skin types depending on the tab. */

/** 2 Aug 2026 — the comp's "Started Aug 2, 2026". */
export function demoStart(): Date {
  return new Date(2026, 7, 2);
}

/**
 * 17 Aug 2026 — chosen, not transcribed.
 *
 * The comp rings 11 Aug as today, but it also marks a check-in on the 14th and
 * captions the button "Last check-in: 3 days ago", and no single day satisfies
 * all three. 15 days after the start does: all five seeded check-ins fall in the
 * past (Aug 2, 5, 9, 11, 14 — the comp's exact chart labels), the last of them
 * is three days ago as captioned, and today stays a ring on a day with no disc,
 * which is the picture the comp is going for.
 */
export function demoToday(): Date {
  return new Date(2026, 7, 17);
}

/** Everything the Progress screen needs, from the user's answers or the demo. */
export type ProgressView = {
  /** false once the user has answered step 4 — then it is all their data */
  isDemo: boolean;
  start: Date;
  today: Date;
  skinType?: string;
  tendencies?: string[];
  current: string | null;
};

export function progressView(a: Answers): ProgressView {
  const answered = investigationStart(a);

  const profile = skinProfile(a);

  if (!answered) {
    return {
      isDemo: true,
      start: demoStart(),
      today: demoToday(),
      skinType: profile.skinType,
      tendencies: profile.tendencies,
      current: DEMO_PROFILE.current,
    };
  }

  return {
    isDemo: false,
    start: answered,
    /* safe: this branch cannot render on the server — see the note above */
    today: new Date(),
    skinType: profile.skinType,
    tendencies: profile.tendencies,
    current: currentSymptoms(a),
  };
}

/** 1-based, so the day the investigation started is "Day 1", not "Day 0". */
export function dayNumber(start: Date, today: Date): number {
  return daysBetween(start, today) + 1;
}

/* The shape of the seeded series — offsets in days from the start date, and the
   severity reported on each. Chosen to match the comp's picture (five points
   descending across roughly a fortnight) rather than to be interesting. */
const DEMO_OFFSETS = [0, 3, 7, 9, 12];
const DEMO_SEVERITY = [9, 7, 5, 3, 1];

/**
 * The seeded check-in history — see the file header.
 *
 * ⚠️ NOTHING IN THE FUTURE. The comp marks Aug 14 as checked in while ringing
 * Aug 11 as today, which cannot happen: you cannot have checked in on a day
 * that has not arrived. The offsets are therefore clipped at `today`, so the
 * calendar's filled discs and the chart's points are always the same set of
 * days and always in the past.
 */
export function demoCheckIns(start: Date, today: Date): CheckIn[] {
  const elapsed = daysBetween(start, today);

  return DEMO_OFFSETS.filter((offset) => offset <= elapsed).map(
    (offset, i) => ({
      date: toIso(
        new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset)
      ),
      severity: DEMO_SEVERITY[i],
    })
  );
}

/**
 * The line under the chart — "Trending: Improving — symptoms decreased 57%
 * since start".
 *
 * Computed from the series rather than hardcoded from the comp, whose own
 * numbers do not agree with its plotted points. Returns null while there is
 * nothing to compare against; one check-in is not a trend.
 */
export function trendSummary(checkIns: CheckIn[]): string | null {
  if (checkIns.length < 2) return null;

  const first = checkIns[0].severity;
  const last = checkIns[checkIns.length - 1].severity;
  if (first === 0) return null;

  const change = Math.round(((first - last) / first) * 100);

  if (change > 0) {
    return `Trending: Improving — symptoms decreased ${change}% since start`;
  }
  if (change < 0) {
    return `Trending: Worsening — symptoms increased ${-change}% since start`;
  }
  return "Trending: Steady — symptoms unchanged since start";
}

/** "Last check-in: 3 days ago" — the caption under `Check in today`. */
export function lastCheckInLabel(
  checkIns: CheckIn[],
  today: Date
): string | null {
  const last = checkIns[checkIns.length - 1];
  const date = last ? fromIso(last.date) : null;
  if (!date) return null;

  const ago = daysBetween(date, today);
  if (ago <= 0) return "Last check-in: today";
  if (ago === 1) return "Last check-in: yesterday";
  return `Last check-in: ${ago} days ago`;
}

/**
 * The profile card's "Current: Redness, Itching on Cheeks" line — step 1's
 * symptoms, placed on step 1's locations.
 *
 * Both halves are optional, so a deep link straight to /progress renders
 * whichever half exists instead of a stranded "Current:" or a bare " on ".
 */
export function currentSymptoms(a: Answers): string | null {
  const symptoms = a.start?.filter(Boolean) ?? [];
  const locations = a.location?.filter(Boolean) ?? [];
  if (symptoms.length === 0 && locations.length === 0) return null;

  if (symptoms.length === 0) return `Affected areas: ${locations.join(", ")}`;
  if (locations.length === 0) return `Current: ${symptoms.join(", ")}`;
  return `Current: ${symptoms.join(", ")} on ${locations.join(", ")}`;
}
