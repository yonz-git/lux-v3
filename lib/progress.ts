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

/**
 * One recorded check-in — `Check-in chat` (555:1268), one per day.
 *
 * `severity` is the absolute symptom score, 0–10, DERIVED from turn 1's
 * relative answer by `severityAfter` — see `SKIN_TREND_CHOICES` for why the
 * question and the storage disagree on purpose.
 *
 * `changes` is turn 2's multi-select ("Less redness", "No change", …).
 * `note` and `photo` are turn 3's optional extras.
 *
 * ⚠️ EVERYTHING PAST `severity` IS WRITTEN BUT NOT YET READ, and that is the
 * comp's own design rather than data invented here: the handoff places
 * `Check-in detail` in the PROGRESS section as "a historical record opened from
 * the Progress calendar", and that screen is what displays them. It has no
 * route yet — see the note on `CheckInCalendar`, which is why the calendar's
 * discs are still plain cells rather than links. Build the two together.
 */
export type CheckIn = {
  date: IsoDate;
  severity: number;
  changes?: string[];
  note?: string;
  /** the capture is a placeholder, so this records THAT a photo was taken */
  photo?: string;
};

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
    };
  }

  return {
    isDemo: false,
    start: answered,
    /* safe: this branch cannot render on the server — see the note above */
    today: new Date(),
    skinType: profile.skinType,
    tendencies: profile.tendencies,
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
 * The profile card's "Current: Redness, Itching on Cheeks" line — symptoms
 * placed on locations.
 *
 * Both halves are optional, so a deep link straight to /progress renders
 * whichever half exists instead of a stranded "Current:" or a bare " on ".
 *
 * ⚠️ A PURE FORMATTER, SPLIT OUT OF `currentSymptoms`. It used to read the
 * answer store directly, which meant the demo had to carry the finished STRING
 * ("Current: Redness, Itching on Cheeks") beside the data it was made of — and
 * the daily check-in, which reports a fresh location each day, had no way in.
 * Now there is one formatter and three callers feed it: step 1's answers, the
 * demo's symptoms/locations, and today's check-in.
 */
export function formatCurrent(
  symptoms: readonly string[],
  locations: readonly string[]
): string | null {
  const s = symptoms.filter(Boolean);
  const l = locations.filter(Boolean);
  if (s.length === 0 && l.length === 0) return null;

  if (s.length === 0) return `Affected areas: ${l.join(", ")}`;
  if (l.length === 0) return `Current: ${s.join(", ")}`;
  return `Current: ${s.join(", ")} on ${l.join(", ")}`;
}

/** Step 1's symptoms on step 1's locations. */
export function currentSymptoms(a: Answers): string | null {
  return formatCurrent(a.start ?? [], a.location ?? []);
}

/** The newest recorded check-in, or null. The list is kept oldest-first. */
export function latestCheckIn(list: CheckIn[]): CheckIn | null {
  return list.length > 0 ? list[list.length - 1] : null;
}

/**
 * The profile card's `Current:` line — the demo's symptoms and locations, or
 * the user's own once they have answered step 1.
 *
 * ⚠️ IT LIVES HERE RATHER THAN ON `ProgressView` because the demo half is now
 * assembled from data like every other half. `ProgressView.current` used to
 * carry the finished string straight out of `DEMO_PROFILE`; see the note there.
 */
export function currentLine(a: Answers, view: ProgressView): string | null {
  return view.isDemo
    ? formatCurrent(DEMO_PROFILE.symptoms, DEMO_PROFILE.locations)
    : formatCurrent(a.start ?? [], a.location ?? []);
}

/* ---------------------------------------------------------------------------
   THE DAILY CHECK-IN

   ⚠️ NOT IN FIGMA, AND DECIDED HERE. `HANDOFF — INVESTIGATION & PROGRESS`
   assigns `Check-in chat` to the CHECK section and draws it as a conversation;
   nothing in the app ever reached it, and `/check` advertises only the
   compatibility check. See components/CheckIn.tsx for the whole argument. What
   it comes down to for this file: a check-in is ONE severity on ONE day, so the
   flow is one question, and the answer feeds `CheckIn` directly.
   -------------------------------------------------------------------------- */

/**
 * The five answers to turn 1 — `Check-in chat` (555:1268) draws these exact
 * labels, in this order.
 *
 * ⚠️ THE QUESTION IS RELATIVE; THE STORED VALUE IS ABSOLUTE. This was the one
 * real conflict between the comp and the trend chart, and both get what they
 * need. `SymptomTrend` plots 0–10 and `trendSummary` divides one severity by
 * another, so a series of "slightly better"s is not something either can read —
 * a percentage computed from relative reports would be a change in a change.
 * But that only rules out STORING the delta. Asking for it is fine, and it is
 * the friendlier question: nobody can rate their own skin 0–10 consistently
 * across a fortnight, while everyone knows whether today is better than
 * yesterday. So the chip carries a delta, `severityAfter` applies it to the
 * last recorded severity, and what lands in `CheckIn` is an absolute score.
 *
 * An earlier build asked the absolute question directly (Clear … Very severe)
 * on the reasoning that relative answers break the chart. The reasoning was
 * sound and the conclusion was wrong — it confused the question with the
 * storage.
 *
 * ±2 and ±4 on a 0–10 axis: "slightly" is a fifth of the scale, "much" is two
 * fifths, and neither can cross the whole range in one day.
 */
export const SKIN_TREND_CHOICES: {
  label: string;
  delta: number;
  direction: "better" | "same" | "worse";
}[] = [
  { label: "Much better", delta: -4, direction: "better" },
  { label: "Slightly better", delta: -2, direction: "better" },
  { label: "About the same", delta: 0, direction: "same" },
  { label: "Slightly worse", delta: 2, direction: "worse" },
  { label: "Much worse", delta: 4, direction: "worse" },
];

/**
 * Today's absolute severity, from a relative answer.
 *
 * ⚠️ THE BASELINE IS THE LAST RECORDED CHECK-IN, and `SEVERITY_MAX / 2` when
 * there is none. "Better than what?" has no answer on day one, so the first
 * check-in starts mid-scale and every later one moves from where the last one
 * left off. Clamped to the axis, so a run of "much better" bottoms out at 0
 * rather than plotting off the floor.
 */
export function severityAfter(previous: CheckIn | null, delta: number): number {
  const base = previous ? previous.severity : SEVERITY_MAX / 2;
  return Math.min(SEVERITY_MAX, Math.max(0, base + delta));
}

/**
 * Turn 2 — `That's good to hear! Any specific changes you've noticed?` and its
 * chips, both of which depend on turn 1's direction.
 *
 * ⚠️ ONLY THE `better` BRANCH IS DRAWN. 555:1268 shows "Slightly better"
 * selected, so it shows the better reply and `Less redness / Less itching /
 * Less dryness / No change`. The conditional is the COMP'S OWN — "That's good
 * to hear!" cannot be what the screen says after "Much worse", and "Less
 * redness" cannot be what it offers. So the other two branches are required by
 * the frame rather than invented on top of it; they mirror its structure and
 * nothing more. **Get the worse/same copy confirmed in Figma.**
 *
 * ⚠️ THE SYMPTOMS ARE THE USER'S OWN. The comp's three — redness, itching,
 * dryness — are exactly the first three of step 1's eight, so these chips are
 * that answer echoed back with a direction on the front, which is what every
 * other screen in the app does with an earlier answer. Falls back to the comp's
 * three when step 1 is unanswered (a deep link, or the demo).
 */
export const CHECK_IN_FALLBACK_SYMPTOMS = ["Redness", "Itching", "Dryness"];

/** The exclusive answer to turn 2 — it is in `EXCLUSIVE_OPTIONS`, so
 *  `toggleMulti` already clears the rest when it is picked. */
export const NO_CHANGE = "No change";

export function changeReply(direction: "better" | "same" | "worse"): string {
  if (direction === "better") {
    return "That's good to hear! Any specific changes you've noticed?";
  }
  if (direction === "worse") {
    return "Sorry to hear that. Any specific changes you've noticed?";
  }
  return "Noted. Any specific changes you've noticed?";
}

export function changeOptions(
  direction: "better" | "same" | "worse",
  symptoms: string[]
): string[] {
  const list = symptoms.length > 0 ? symptoms : CHECK_IN_FALLBACK_SYMPTOMS;
  const lower = list.map((s) => s.toLowerCase());

  /* "About the same" overall still allows one symptom to have moved either
     way — that is exactly what the question is for — so it offers both
     directions rather than a third vocabulary of its own. */
  const prefixed =
    direction === "same"
      ? [...lower.map((s) => `Less ${s}`), ...lower.map((s) => `More ${s}`)]
      : lower.map((s) => `${direction === "better" ? "Less" : "More"} ${s}`);

  return [...prefixed, NO_CHANGE];
}

/**
 * Add one check-in to the recorded list, oldest first.
 *
 * ⚠️ ONE ENTRY PER DAY — a second answer on a day already recorded REPLACES the
 * first rather than appending. Two discs cannot share a calendar square and two
 * points cannot share an x position, so the alternative is a chart that lies
 * about how many days it covers.
 */
export function recordCheckIn(current: CheckIn[], entry: CheckIn): CheckIn[] {
  return [...current.filter((c) => c.date !== entry.date), entry].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  );
}

/**
 * What `/progress` actually plots — the user's own check-ins, plus the seeded
 * series only while the whole screen is the demo.
 *
 * ⚠️ THE SEED STOPS THE MOMENT THE INVESTIGATION IS REAL. It used to be
 * unconditional: a user who walked the flow and answered step 4 still got five
 * invented check-ins anchored to their own start date, which is a readout
 * inventing its own data. That was defensible only while nothing could WRITE a
 * check-in. Something can now, so the real branch shows exactly what the user
 * recorded and nothing else — an empty chart until they check in, which
 * `SymptomTrend` and the calendar both already render.
 *
 * ⚠️ IN DEMO MODE THE TWO ARE MERGED, on purpose. A check-in recorded during a
 * demo walk is dated the demo's frozen today (17 Aug 2026 — see `demoToday`),
 * so it lands three days after the last seeded point and joins the same series
 * rather than stranding itself weeks to the right of it. That is the whole
 * value of the button on a portfolio walk: tap it and the calendar fills today,
 * the chart grows a sixth point and the caption flips to "Last check-in: today".
 * A user entry always wins over a seeded one on the same day.
 */
export function checkInsFor(a: Answers, view: ProgressView): CheckIn[] {
  const recorded = (a.checkIns ?? []).filter(
    (c) => daysBetween(fromIso(c.date) ?? view.today, view.today) >= 0
  );

  if (!view.isDemo) return recorded;

  return recorded.reduce(recordCheckIn, demoCheckIns(view.start, view.today));
}
