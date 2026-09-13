/**
 * What the PROGRESS section reads.
 *
 * Figma `Progress — empty` (551:1196 / 551:1231) and `Progress — active`
 * (552:1236 / 554:1252), documented by `HANDOFF — INVESTIGATION & PROGRESS`
 * (559:1376).
 *
 * ⚠️ THE CHECK-IN HISTORY IS SEEDED ON BOTH BRANCHES, AT TWO DENSITIES. The
 * Progress screens are READOUTS of daily check-ins — the calendar marks the
 * days you checked in and the chart plots the severity you reported — and
 * something writes those now, so for a while a REAL investigation plotted
 * exactly what the user recorded and nothing else. What that produced in
 * practice is the state a reader of this prototype is in MOST of the time:
 * walk the flow, answer step 4, and `/progress` opens on an empty calendar and
 * a chart with no line. The demo keeps its nine days; a real investigation now
 * gets the comp's own FIVE, anchored to the user's flare date. Both are clipped
 * at today and both merge with whatever the user records. See `checkInsFor` and
 * `SAMPLE_OFFSETS`.
 *
 * The seed is anchored to a start date and clipped at today, and everything the
 * screen states about it — the day count, the percentage, "3 days ago" — is
 * computed from the series rather than transcribed from the comp, so the screen
 * stays internally consistent whatever date it runs from. That start date is the
 * user's own answer once they have given one, and `today - DEMO_SPAN` until
 * then; see THE DEMO INVESTIGATION below for why `/progress` opens populated.
 * Every entry point is named `demo*` so nothing mistakes them for a data layer.
 * Delete them the moment CHECK writes real check-ins.
 */
import type { Answers } from "@/lib/store/answers";
import { DEMO_PROFILE, ownedProducts, skinProfile } from "@/lib/demo";
import { type IsoDate, addDays, daysBetween, fromIso, toIso } from "@/lib/date";
import type { SavedProduct } from "@/features/products/products";
import { FACE_REGION_IDS } from "@/features/my-skin/components/FaceDiagram";
import { conditionsList } from "@/features/my-skin/profile";

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
 * ⚠️ EVERYTHING PAST `severity` IS READ BY `Check-in detail`, and by nothing
 * else. The handoff places that screen in the PROGRESS section as "a historical
 * record opened from the Progress calendar"; it has a route now
 * (`/progress/check-in/<iso>`) and the calendar's discs are the links to it, so
 * these three fields went from written-and-unread to the whole content of a
 * screen. Which is why the SEED carries them too — see `demoExtras`.
 */
export type CheckIn = {
  date: IsoDate;
  severity: number;
  changes?: string[];
  /**
   * Turn 1's direction, kept so `Check-in detail` can colour the changes by it.
   * ⚠️ ABSENT ON THE SEED AND ON RECORDS WRITTEN BEFORE 13 Sep 2026 — read it
   * through `checkInDirection`, which derives it from the severities instead.
   */
  direction?: "better" | "same" | "worse";
  note?: string;
  /** the capture is a placeholder, so this records THAT a photo was taken */
  photo?: string;
  /**
   * The products this record says were in use that day — ids into the user's
   * own library. Written by `Check-in detail`, which edits the list in place.
   *
   * ⚠️ ABSENT IS NOT EMPTY. Absent means nobody has touched this day's list, so
   * `productsForCheckIn` derives it from `addedOn` the way the screen always
   * has. An array — including an empty one — means the list is the user's and
   * is allowed to be empty: exactly the distinction `ownedProducts` draws on
   * the library itself.
   *
   * ⚠️ IDS, NOT PRODUCTS. `checkBasket` stores whole products because a basket
   * row can be a live Open Beauty Facts result that exists in no library; a
   * check-in's row is something you OWN, so the id keeps ONE copy of the name,
   * the size and `addedOn` rather than a snapshot that goes stale the moment
   * the library entry changes. An id whose product has left the library drops
   * out of the list.
   */
  products?: string[];
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

   ⚠️ THE DEMO CLOCK IS THE REAL CLOCK, AND THE SEED IS MEASURED BACK FROM IT.
   It used to be frozen at 17 Aug 2026 so the demo path was a pure function of
   nothing and could prerender safely. The freeze is gone: the calendar rings
   the real today, and `demoStart` is simply `today - DEMO_SPAN`, so the whole
   seeded fortnight slides along with the date the reader is actually on.

   ⚠️ NOTHING IN THIS MODULE READS A CLOCK, AND THAT IS WHAT MAKES IT SAFE.
   `new Date()` called during render is exactly what the freeze existed to
   avoid — it bakes a date into the prerendered HTML, and the server keeps UTC
   where the reader keeps local time, so for some hours of every day the two
   disagree about what day it is and React hydrates a mismatch. So the clock is
   a PARAMETER here and the components take it from `useToday`, which reproduces
   the server's timestamp on the first client render and corrects to the
   browser's own afterwards. See `lib/useToday.ts`.

   ⚠️ THE COMP'S FIVE DATES ARE GONE AND THE COMP'S SHAPE IS NOT. Anchored to a
   fixed 2 Aug the offsets landed the comp's own days on Aug 2, 5, 9, 11 and 14
   under an "August 2026" header. What the frame is really specifying is a
   RELATIVE picture — a fortnight of check-ins, the last of them three days
   back, today a ring on an empty day — and `DEMO_SPAN` plus `DEMO_OFFSETS`
   still reproduce all three on whatever date the app is opened. The absolute
   dates were the transcription; the intervals are the design.

   ⚠️ ONE THING THE REAL CLOCK COSTS, and it is worth knowing before you chase
   it: `DEMO_PRODUCTS` in lib/demo.ts still carries FIXED `addedOn` dates
   (Jun–Aug 2026), so `productsUsedOn` now returns all five on every seeded day
   instead of a routine that grows across the fortnight. Making those relative
   too means threading a clock through `ownedProducts`, which PRODUCTS and CHECK
   both call from screens that have none. Left alone rather than half-done.
   -------------------------------------------------------------------------- */

/* The seeded profile lives in lib/demo.ts — PROGRESS and CHECK share it, so the
   demo cannot claim two different skin types depending on the tab. */

/**
 * How far back the seeded investigation began — 15 days, and the number is
 * load-bearing.
 *
 * `DEMO_OFFSETS` ends at 12, so a 15-day span puts the last seeded check-in
 * three days ago, which is what makes the button's caption read "Last check-in:
 * 3 days ago" — one of the three facts the comp states at once. It also leaves
 * today a ring on a day with no disc, which is the picture the frame draws, and
 * keeps every seeded day in the past. Change it and all three move.
 */
const DEMO_SPAN = 15;

/** Where the seeded investigation started: `DEMO_SPAN` days before today. */
export function demoStart(today: Date): Date {
  return addDays(today, -DEMO_SPAN);
}

/** Everything the Progress screen needs, from the user's answers or the demo. */
export type ProgressView = {
  /** false once the user has answered step 4 — then it is all their data */
  isDemo: boolean;
  start: Date;
  today: Date;
  skinType?: string;
  tendencies?: string[];
  /**
   * Step 3's answer, read exactly as the profile recap reads it. ⚠️ NO DEMO
   * VALUE — `DEMO_PROFILE` carries no conditions, and a demo does not get to
   * claim a diagnosis on the user's behalf, so the column is simply absent
   * until step 3 is answered.
   */
  conditions: string[];
};

/**
 * ⚠️ `today` IS PASSED IN, NEVER READ FROM THE CLOCK HERE — see the note above.
 * Callers get it from `useToday`.
 */
export function progressView(a: Answers, today: Date): ProgressView {
  const answered = investigationStart(a);

  const profile = skinProfile(a);

  return {
    isDemo: !answered,
    start: answered ?? demoStart(today),
    today,
    skinType: profile.skinType,
    tendencies: profile.tendencies,
    conditions: conditionsList(a),
  };
}

/** 1-based, so the day the investigation started is "Day 1", not "Day 0". */
export function dayNumber(start: Date, today: Date): number {
  return daysBetween(start, today) + 1;
}

/* The shape of the seeded series — offsets in days from the start date, and the
   severity reported on each.
 *
 * ⚠️ IT WAS FIVE POINTS AND IS NOW NINE, AND THE COMP'S FIVE ARE STILL IN IT
 * at their original severities: offsets 0, 3, 7, 9 and 12 are Aug 2, 5, 9, 11
 * and 14 at 9, 7, 5, 3 and 1, which is the chart the comp draws. The other four
 * are filled in between them.
 *
 * The reason is that the calendar is not a chart. Five discs on a 31-day grid
 * is a month in which the user checked in once every three days, under a
 * heading that calls this a DAILY check-in — and now that every disc is a link
 * to `Check-in detail`, five discs is also five reachable records out of a
 * fortnight. A prototype has to be walkable: a reader clicking around the
 * calendar should land on a record most times they try, not one time in three.
 *
 * ⚠️ EVERY STEP IS 0, ±2 OR ±4 — the deltas `SKIN_TREND_CHOICES` actually
 * offers. A seeded series that the app's own check-in chat could not have
 * produced is a readout inventing data the writer cannot write, and it would
 * show up the moment anyone compared a seeded day against one they recorded.
 *
 * ⚠️ IT IS NOT MONOTONIC ANY MORE, ON PURPOSE. Offset 5 goes UP (5 → 7), and
 * offsets 1 and 10 hold flat. `demoChanges` derives its direction from the
 * step, so those are the only seeded days that can produce "More redness" and
 * "No change" — with a purely descending series every one of the nine detail
 * screens read "Less redness, Less itching", i.e. the screen demonstrating the
 * record could only ever show a third of what the record holds. The trend still
 * ends where it did: 9 → 1, "Improving, symptoms decreased 89%".
 *
 * ⚠️ IT STILL ENDS AT OFFSET 12, AND THAT IS A CONSTRAINT, NOT A GAP. 12 is
 * three days before today on a 15-day span, which is what makes the button's
 * caption "Last check-in: 3 days ago" true — one of the three facts that fix
 * `DEMO_SPAN` at all (see it). Filling 13 and 14 flipped the caption to
 * "yesterday" and quietly broke the frame it was matching. Fill BETWEEN the
 * comp's days; do not extend past the last one. */
const DEMO_OFFSETS = [0, 1, 3, 4, 5, 7, 9, 10, 12];
const DEMO_SEVERITY = [9, 9, 7, 5, 7, 5, 3, 3, 1];

/**
 * The FIVE-POINT sample the REAL branch seeds — the comp's own days and
 * severities, i.e. the subset `DEMO_OFFSETS` was widened from.
 *
 * ⚠️ THIS IS A PROTOTYPE SEED ON A REAL INVESTIGATION, WHICH THE DEMO SEED
 * DELIBERATELY IS NOT. Answering step 4 flips `isDemo` false, and until now
 * that took the whole seeded fortnight with it: walk the flow and `/progress`
 * arrives with an empty calendar and a trend chart with no line, because
 * nothing has written a check-in yet. That is the honest readout and it is
 * also the state a reader of this prototype spends most of their time in — the
 * flow is the thing they walk, so the flow is the path that lands them on the
 * dead chart.
 *
 * So the real branch seeds too, and it seeds FIVE rather than nine: nine is the
 * density the CALENDAR needs to look like a daily habit, five is what the CHART
 * needs to have a shape, and on a real investigation the fewer invented days
 * the better. They are the comp's own — `Progress — active` plots 9, 7, 5, 3, 1
 * — so the five sample days and the demo's nine cannot disagree about the
 * series they are both drawn from.
 *
 * ⚠️ ANCHORED TO THE USER'S OWN FLARE DATE, NOT TO TODAY, and clipped at both
 * ends by `checkInsFor` like every other entry. A user who answered step 4 with
 * "three days ago" gets the two offsets that fit and no invented future.
 *
 * ⚠️ DELETE THIS WITH THE REST OF THE SEED the moment there is a backend. It is
 * the one place the app puts words in a real user's mouth, and it exists only
 * because a portfolio walk has to reach a populated dashboard.
 */
const SAMPLE_OFFSETS = [0, 3, 7, 9, 12];
const SAMPLE_SEVERITY = [9, 7, 5, 3, 1];

/**
 * The seeded check-in history — see the file header.
 *
 * ⚠️ NOTHING IN THE FUTURE. The comp marks Aug 14 as checked in while ringing
 * Aug 11 as today, which cannot happen: you cannot have checked in on a day
 * that has not arrived. The offsets are therefore clipped at `today`, so the
 * calendar's filled discs and the chart's points are always the same set of
 * days and always in the past.
 */
export function demoCheckIns(
  start: Date,
  today: Date,
  offsets: readonly number[] = DEMO_OFFSETS,
  severities: readonly number[] = DEMO_SEVERITY
): CheckIn[] {
  const elapsed = daysBetween(start, today);

  return offsets.filter((offset) => offset <= elapsed).map(
    (offset, i) => ({
      date: toIso(
        new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset)
      ),
      severity: severities[i],
      /* the rest of the record — see DEMO_EXTRAS */
      ...demoExtras(i, offset, severities),
    })
  );
}

/**
 * The seeded check-in's `changes`, `note` and `photo` — everything
 * `Check-in detail` (556:1330) displays that a bare severity does not carry.
 *
 * ⚠️ THE SEED HAD TO GROW, AND IT GREW BY DERIVATION. `demoCheckIns` seeded a
 * date and a severity because that is all `/progress` reads — a disc on the
 * calendar and a point on the chart. The detail screen reads the whole record,
 * so on the demo path every seeded day opened on a screen with one card on it,
 * which is the check-in detail failing to demonstrate the check-in detail.
 *
 * ⚠️ `changes` IS COMPUTED FROM THE SERIES, NOT TRANSCRIBED. The direction is
 * whichever way the severity moved from the day before — the same fact turn 1
 * of the chat asks for — and the symptoms are the demo profile's own, prefixed
 * exactly as `changeOptions` prefixes them. So the seeded series cannot claim
 * "Less redness" on a day its own plotted point went up.
 *
 * ⚠️ AND DAY 1 IS NOT DIRECTIONLESS — IT IS MEASURED AGAINST THE SAME BASE THE
 * CHAT USES. This returned nothing for the first day, on the grounds that it
 * has no previous point; `severityAfter` disagrees, and it is the writer. A
 * real first check-in has no previous point either, and the chat still asks
 * turn 1 and still applies the delta — to `SEVERITY_MAX / 2`, the midpoint it
 * assumes when there is nothing to compare against. So the seed's day 1 gets
 * that same base rather than an exemption, and 2 Aug stops being the one
 * record in nine with no SYMPTOMS REPORTED card on it, which read as a hole in
 * the demo rather than as a state the screen handles.
 *
 * ⚠️ THE NOTE SITS ON ONE DAY, and it is the comp's own: offset 3 is 5 Aug
 * 2026, `Check-in detail`'s date, and the note is the comp's sentence. Every
 * other seeded day carries none, because a real fortnight of check-ins is not a
 * fortnight of written notes — and the screen has to render the absence as
 * readily as the presence.
 *
 * ⚠️ THE PHOTO USED TO SIT ON THAT SAME DAY AND NOW SITS ON EVERY ONE. A note
 * and a photo are not the same cost: a note is typing a sentence, which is why
 * one day in nine is honest, while a photo is one tap on the capture the chat
 * already offers. For a FLARE investigation it is also the point —
 * photographing the affected area IS the record the whole app exists to
 * compare, so a day-by-day series with gaps in it is a comparison with gaps in
 * it. Coupled to the note, the PHOTOS card and `CheckInPhotoArt` with it
 * appeared on exactly one screen in the app.
 *
 * ⚠️ IT WAS BRIEFLY DERIVED — a photo only on days that reported a CHANGE,
 * leaving offsets 1 and 10 bare so the seed exercised the absence as well as
 * the presence. Overruled deliberately: an unbroken photo diary is the more
 * useful demo, and the absent case is not lost, because `photo` is optional and
 * a real user who checks in without tapping "Take a photo" still produces it.
 * The seed no longer covers that path — if the empty state needs a screenshot,
 * walk a check-in rather than reading it off `/progress`.
 */
/**
 * ⚠️ ANCHORED TO THE OFFSET, NOT TO A POSITION IN THE ARRAY. This was
 * `DEMO_NOTE_OFFSET_INDEX = 1`, i.e. "whichever day happens to be second" —
 * true of 5 Aug only while `DEMO_OFFSETS` began `[0, 3, …]`. Widening the
 * series moved the comp's own note onto 3 Aug without touching this line, and
 * nothing would have failed: the detail screen would simply have drawn the
 * NOTES and PHOTOS cards on the wrong day. The offset is the fact being
 * declared, so declare the offset. */
const DEMO_NOTE_OFFSET = 3; /* 5 Aug 2026 — `Check-in detail`'s own date */
const DEMO_NOTE =
  "Patches on cheeks seem slightly less red than yesterday. Still itchy in the evening.";

/* ⚠️ THE SAME SENTINEL `CheckIn.photo` IS DOCUMENTED TO HOLD AND THE CHAT
   WRITES (`components/CheckIn.tsx`) — every capture surface in LUX is a
   placeholder, so this records THAT a photo was taken and never an image. The
   picture itself is `CheckInPhotoArt`, which since 13 Sep 2026 shows one
   sample photograph for every capture. */
const DEMO_PHOTO = "captured";

function demoExtras(
  i: number,
  offset: number,
  severities: readonly number[]
): Partial<CheckIn> {
  return {
    changes: demoChanges(i, severities),
    photo: DEMO_PHOTO,
    ...(offset === DEMO_NOTE_OFFSET ? { note: DEMO_NOTE } : {}),
  };
}

function demoChanges(i: number, severities: readonly number[]): string[] {
  /* the midpoint `severityAfter` applies a first check-in's delta to — see the
     day-1 note above */
  const previous = i === 0 ? SEVERITY_MAX / 2 : severities[i - 1];
  const severity = severities[i];
  if (severity === previous) return [NO_CHANGE];

  const direction = severity < previous ? "better" : "worse";
  const prefix = direction === "better" ? "Less" : "More";

  return DEMO_PROFILE.symptoms.map((s) => `${prefix} ${s.toLowerCase()}`);
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
    return `Trending: Improving, symptoms decreased ${change}% since start`;
  }
  if (change < 0) {
    return `Trending: Worsening, symptoms increased ${-change}% since start`;
  }
  return "Trending: Steady, symptoms unchanged since start";
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
 * The profile card's current-state readout — symptoms placed on locations,
 * as a LABEL over a VALUE rather than one prefixed sentence.
 *
 * ⚠️ IT WAS `Current: Redness, Itching on Cheeks` ON ONE `t-body3` LINE UNTIL
 * 8 Sep 2026, AND THAT WAS THE ODD ONE OUT ON THIS CARD. Everything above it —
 * skin type, tendency — is a muted label over a value a size up, and the
 * card's only other fact wore its label inline as a colon prefix instead. It is
 * a pair now, drawn exactly like the two above it, so the answer reads as an
 * answer and not as a caption.
 *
 * Both halves are still optional, so a deep link straight to /progress renders
 * whichever half exists instead of a stranded label or a bare " on " — and the
 * LABEL moves with them: locations alone are `Affected areas`, because "Whole
 * face, Forehead" is not a state.
 *
 * ⚠️ A PURE FORMATTER, SPLIT OUT OF `currentSymptoms`. It used to read the
 * answer store directly, which meant the demo had to carry the finished STRING
 * ("Current: Redness, Itching on Cheeks") beside the data it was made of — and
 * the daily check-in, which reports a fresh location each day, had no way in.
 * Now there is one formatter and three callers feed it: step 1's answers, the
 * demo's symptoms/locations, and today's check-in.
 */
export type CurrentState = {
  label: string;
  /** the whole state as one sentence — the accessible reading of the pair */
  value: string;
  /** ⚠️ the parts, so `SkinProfile` can draw symptoms as pills over the
      locations line (13 Sep 2026) without re-parsing `value` */
  symptoms: string[];
  locations: string[];
};

export function formatCurrent(
  symptoms: readonly string[],
  locations: readonly string[]
): CurrentState | null {
  const s = symptoms.filter(Boolean);
  const l = locations.filter(Boolean);
  if (s.length === 0 && l.length === 0) return null;

  if (s.length === 0)
    return { label: "Affected areas", value: l.join(", "), symptoms: s, locations: l };
  if (l.length === 0)
    return { label: "Current state", value: s.join(", "), symptoms: s, locations: l };
  return {
    label: "Current state",
    value: `${s.join(", ")} on ${l.join(", ")}`,
    symptoms: s,
    locations: l,
  };
}

/** Step 1's symptoms on step 1's locations. */
export function currentSymptoms(a: Answers): CurrentState | null {
  return formatCurrent(a.start ?? [], a.location ?? []);
}

/** The newest recorded check-in, or null. The list is kept oldest-first. */
export function latestCheckIn(list: CheckIn[]): CheckIn | null {
  return list.length > 0 ? list[list.length - 1] : null;
}

/**
 * The profile card's current-state pair — the demo's symptoms and locations,
 * or the user's own once they have answered step 1.
 *
 * ⚠️ IT LIVES HERE RATHER THAN ON `ProgressView` because the demo half is now
 * assembled from data like every other half. `ProgressView.current` used to
 * carry the finished string straight out of `DEMO_PROFILE`; see the note there.
 */
export function currentLine(
  a: Answers,
  view: ProgressView
): CurrentState | null {
  return view.isDemo
    ? formatCurrent(DEMO_PROFILE.symptoms, DEMO_PROFILE.locations)
    : formatCurrent(a.start ?? [], a.location ?? []);
}

/**
 * The profile's locations split for the read-only face diagram under it —
 * the regions that are pills on the face, and everything else.
 *
 * ⚠️ NOT IN FIGMA — the diagram joined `/progress` on 13 Sep 2026, asked for
 * directly. ⚠️ "Cheeks" IS NOT A REGION ID. The demo's location predates the
 * diagram's `Cheeks (L)` / `Cheeks (R)`, and read raw it would light nothing;
 * it expands to both here rather than in `DEMO_PROFILE`, so the profile card's
 * hidden current-state sentence still reads "Redness, Itching on Cheeks".
 */
export function faceLocations(current: CurrentState | null): {
  faceRegions: string[];
  otherLocations: string[];
} {
  const locations = (current?.locations ?? []).flatMap((l) =>
    l === "Cheeks" ? ["Cheeks (L)", "Cheeks (R)"] : [l]
  );
  return {
    faceRegions: locations.filter((l) => FACE_REGION_IDS.includes(l)),
    otherLocations: locations.filter((l) => !FACE_REGION_IDS.includes(l)),
  };
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
 * ⚠️ THE SEED NO LONGER STOPS WHEN THE INVESTIGATION GOES REAL — IT THINS.
 * It was unconditional, then it was demo-only on the reasoning that a readout
 * must not invent its own data once something can WRITE that data. The reading
 * was right about the principle and wrong about this build: the flow is the
 * thing a reader walks, so the demo-only seed handed every reader who finished
 * step 4 an empty calendar and a flat chart — the trend graph, which is the
 * design being shown, could only be seen by NOT walking the app. The real
 * branch seeds five (`SAMPLE_OFFSETS`) against the demo's nine, and the honest
 * empty readout is still built and still reachable at `/progress/empty`.
 *
 * ⚠️ THE TWO ARE MERGED ON BOTH BRANCHES, on purpose. A check-in recorded during a
 * demo walk is dated the demo's today, which is the real one, so it lands three
 * days after the last seeded point and joins the same series rather than
 * stranding itself to the right of it. That is the whole
 * value of the button on a portfolio walk: tap it and the calendar fills today,
 * the chart grows a sixth point and the caption flips to "Last check-in: today".
 * A user entry always wins over a seeded one on the same day.
 *
 * ⚠️ THE WINDOW IS CLIPPED AT BOTH ENDS, AND THE SECOND CLIP IS THE DEMO→REAL
 * HANDOFF. Nothing in the future has always been dropped — you cannot have
 * checked in on a day that has not arrived. Nothing BEFORE `view.start` is
 * dropped for the mirror-image reason, and it is what stops a demo walk
 * leaking into a real investigation: check in on the demo screen and the entry
 * is dated today, then answer step 4 with a flare date LATER than that. The
 * seed disappears as it should, but that entry survived in the store — so the
 * calendar could open on a month behind the one today is in, showing a single
 * stranded disc with today's ring nowhere in sight, and the chart plotted a
 * point before day 1 of the investigation. A
 * record from before the investigation began is the readout inventing data,
 * which is the exact failure the demo clip above was added to fix.
 *
 * One filter, both branches, no special case: the demo's own start is 2 Aug and
 * its offsets begin at 0, so the demo path is unchanged. ⚠️ The cost is that
 * moving your flare date LATER discards check-ins now behind it — correct, on
 * the same reasoning, but it is a decision rather than an obvious truth.
 */
export function checkInsFor(a: Answers, view: ProgressView): CheckIn[] {
  const recorded = (a.checkIns ?? []).filter((c) => {
    const day = fromIso(c.date) ?? view.today;
    return (
      daysBetween(day, view.today) >= 0 && daysBetween(view.start, day) >= 0
    );
  });

  const seed = view.isDemo
    ? demoCheckIns(view.start, view.today)
    : demoCheckIns(view.start, view.today, SAMPLE_OFFSETS, SAMPLE_SEVERITY);

  return recorded.reduce(recordCheckIn, seed);
}

/* ---------------------------------------------------------------------------
   CHECK-IN DETAIL — `Check-in detail` (556:1330 / 557:1353)

   The historical record for ONE day, opened from the Progress calendar. The
   severity, the changes, the note and the photo are the ones the chat wrote —
   the screen reads them and states nothing it cannot derive.

   ⚠️ THE PRODUCT LIST IS THE ONE EXCEPTION, AND IT IS NEW STATE. It began as a
   pure derivation from `addedOn` and stays one until the user edits it, at
   which point the day's list becomes `CheckIn.products` and the derivation
   steps aside. See `productsUsedOn` for why the derivation was right on its
   own and no longer is.
   -------------------------------------------------------------------------- */

/** One day's record, or null if the user did not check in that day. */
export function checkInOn(list: CheckIn[], date: IsoDate): CheckIn | null {
  return list.find((c) => c.date === date) ?? null;
}

/**
 * The word beside the number — `Check-in detail` writes "Moderate" against
 * "6 / 10".
 *
 * ⚠️ THE BANDS ARE THE SCALE'S, NOT THE COMP'S. The comp gives one pairing and
 * the screen has to name every value on a 0–10 axis, so the axis is split into
 * the five bands the check-in's own five answers imply — and 6 lands in the
 * middle one, which is what the comp draws. Five names for five steps, with the
 * widest band in the middle where most days sit.
 */
export function severityLabel(severity: number): string {
  if (severity <= 1) return "Clear";
  if (severity <= 3) return "Mild";
  if (severity <= 6) return "Moderate";
  if (severity <= 8) return "Severe";
  return "Very severe";
}

/**
 * `card · products used` — what was in the routine on the day of a check-in.
 *
 * ⚠️ IT IS THE DEFAULT, NOT THE ANSWER — see `productsForCheckIn`. The chat's
 * three turns ask about skin, not about products, so nothing WRITES a per-day
 * product list at the moment the check-in is recorded, and adding a fourth turn
 * would change a screen the frame draws. What the app already knows is when
 * each product entered the library, so "used on 5 Aug" starts as every product
 * added on or before it. A product added later cannot have been in that day's
 * routine, which is the error the screen would otherwise make on every day but
 * the most recent.
 *
 * ⚠️ WHAT THE DERIVATION CANNOT KNOW is that you own a cleanser and did not use
 * it that day, or that you used something you only entered into the library
 * afterwards. Owning a product is not using it, and the record is the user's.
 * So the list is editable on the screen, and an edit stores `CheckIn.products`
 * — from then on this function is the thing that day's list was BEFORE anyone
 * corrected it, and no longer what it shows.
 *
 * ⚠️ THE COMP'S SECOND LINE — "Moisturizer · Applied Morning & Night" — HAS NO
 * DATA BEHIND IT. LUX stores no product category and no routine time; inventing
 * either would put a fact on screen that nothing in the app can be right about.
 * `CheckInDetail` writes the two facts the product actually carries instead.
 */
export function productsUsedOn(a: Answers, date: IsoDate): SavedProduct[] {
  return ownedProducts(a).filter((p) => p.addedOn <= date);
}

/**
 * What the record's `Products used` card actually lists — the user's own list
 * once they have edited one, the `addedOn` derivation until then.
 *
 * ⚠️ THE ORDER IS THE LIBRARY'S, IN BOTH BRANCHES. Filtering `ownedProducts`
 * rather than mapping the stored ids is what guarantees that: a list you have
 * edited reads in the same order as one you have not, so adding a product back
 * does not park it at the bottom where it looks like a different kind of row.
 * The stored order therefore carries no meaning, which is why nothing preserves
 * it.
 */
export function productsForCheckIn(a: Answers, entry: CheckIn): SavedProduct[] {
  if (!entry.products) return productsUsedOn(a, entry.date);
  const ids = new Set(entry.products);
  return ownedProducts(a).filter((p) => ids.has(p.id));
}

/**
 * The store update for one edit of a day's product list.
 *
 * ⚠️ IT RESOLVES THE ENTRY AGAINST THE LIST IT IS UPDATING, not against the one
 * the screen rendered — the updater-form rule, and it earns its keep twice
 * here. Two taps in one tick would otherwise both start from the same rendered
 * snapshot and the first would be lost; and on the demo path the day being
 * edited usually has NO entry in the store at all, because it is seeded. The
 * fallback to `entry` is what materialises the seeded record, whole, on the
 * first edit — severity, changes, note and photo included, so correcting a
 * product list cannot quietly drop the rest of the day.
 */
/**
 * The store update for one edit of a day's NOTE — the same reducer shape
 * `editProductsUsed` has, and for the same two reasons: the updater form so two
 * edits in one tick cannot start from the same rendered snapshot, and the
 * fallback to `entry` so editing a SEEDED day materialises the whole record
 * (severity, changes, products, photo) rather than writing a note-only entry
 * that drops the rest of the day.
 *
 * ⚠️ AN EMPTY NOTE IS NO NOTE, NOT AN EMPTY ONE. `CheckIn.note` is optional and
 * every reader tests it for truthiness, so clearing the field DELETES the key
 * instead of storing `""` — otherwise the record would carry a note that the
 * detail screen draws as an empty pair of quotation marks. Whitespace is
 * trimmed here rather than in the screen, so both callers cannot disagree about
 * what counts as blank.
 */
export function editNote(
  entry: CheckIn,
  note: string
): (current: CheckIn[] | undefined) => CheckIn[] {
  return (current) => {
    const list = current ?? [];
    const stored = list.find((c) => c.date === entry.date) ?? entry;
    const trimmed = note.trim();
    const { note: _dropped, ...rest } = stored;
    return recordCheckIn(
      list,
      trimmed ? { ...rest, note: trimmed } : { ...rest }
    );
  };
}

export function editProductsUsed(
  a: Answers,
  entry: CheckIn,
  change: (ids: string[]) => string[]
): (current: CheckIn[] | undefined) => CheckIn[] {
  return (current) => {
    const list = current ?? [];
    const stored = list.find((c) => c.date === entry.date) ?? entry;
    const ids =
      stored.products ?? productsUsedOn(a, entry.date).map((p) => p.id);
    return recordCheckIn(list, { ...stored, products: change(ids) });
  };
}

/**
 * Which way turn 1 said the skin moved on this record.
 *
 * The stored answer when there is one. Otherwise it is derived the way
 * `demoChanges` derives the seed — this severity against the previous record's,
 * or against `SEVERITY_MAX / 2` for the first — so the seed and older records
 * agree with the words already on their pills.
 */
export function checkInDirection(
  list: CheckIn[],
  entry: CheckIn
): "better" | "same" | "worse" {
  if (entry.direction) return entry.direction;
  const previous = list
    .filter((c) => c.date < entry.date)
    .reduce<CheckIn | null>((a, c) => (!a || c.date > a.date ? c : a), null);
  const base = previous ? previous.severity : SEVERITY_MAX / 2;
  if (entry.severity === base) return "same";
  return entry.severity < base ? "better" : "worse";
}
