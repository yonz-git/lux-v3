/**
 * What the PROGRESS section reads.
 *
 * Figma `Progress — empty` (551:1196 / 551:1231) and `Progress — active`
 * (552:1236 / 554:1252), documented by `HANDOFF — INVESTIGATION & PROGRESS`
 * (559:1376).
 *
 * ⚠️ THE CHECK-IN HISTORY IS SEEDED ONLY WHILE THE SCREEN IS THE DEMO. The
 * Progress screens are READOUTS of daily check-ins — the calendar marks the
 * days you checked in and the chart plots the severity you reported. Something
 * writes those now: the daily check-in ships at `/progress/check-in`, so a REAL
 * investigation plots exactly what the user recorded and nothing else. The seed
 * survives for the demo path alone, because the alternative on a portfolio walk
 * is a screen that renders an empty calendar and a chart with no line — which
 * shows nothing about whether the design works. See `checkInsFor`.
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
import type { Answers } from "@/lib/store/answers";
import { DEMO_PROFILE, ownedProducts, skinProfile } from "@/lib/demo";
import { type IsoDate, daysBetween, fromIso, toIso } from "@/lib/date";
import type { SavedProduct } from "@/features/products/products";

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
   2. Fidelity. Anchored to 2 Aug 2026 the seeded offsets put the comp's own
      five days on Aug 2, 5, 9, 11 and 14 — exactly the points it plots — under
      an "August 2026" calendar header, exactly the comp's. A relative clock
      would drift off both.

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
 * all three. 15 days after the start does: every seeded check-in falls in the
 * past, the last of them (14 Aug) is three days ago as captioned, and today
 * stays a ring on a day with no disc, which is the picture the comp is going
 * for. The comp's own five — Aug 2, 5, 9, 11, 14 — are all still in the series;
 * see `DEMO_OFFSETS` for the four filled in between them.
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
 * 14 Aug, three days before `demoToday`, which is what makes the comp's caption
 * "Last check-in: 3 days ago" true — one of the three facts that pins the demo
 * clock at all (see `demoToday`). Filling 13 and 14 flipped the caption to
 * "yesterday" and quietly broke the frame it was matching. Fill BETWEEN the
 * comp's days; do not extend past the last one. */
const DEMO_OFFSETS = [0, 1, 3, 4, 5, 7, 9, 10, 12];
const DEMO_SEVERITY = [9, 9, 7, 5, 7, 5, 3, 3, 1];

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
      /* the rest of the record — see DEMO_EXTRAS */
      ...demoExtras(i, offset),
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
   picture itself is drawn by `CheckInPhotoArt` from the DATE, so seven seeded
   days give seven different captures without seven assets. */
const DEMO_PHOTO = "captured";

function demoExtras(i: number, offset: number): Partial<CheckIn> {
  return {
    changes: demoChanges(i),
    photo: DEMO_PHOTO,
    ...(offset === DEMO_NOTE_OFFSET ? { note: DEMO_NOTE } : {}),
  };
}

function demoChanges(i: number): string[] {
  /* the midpoint `severityAfter` applies a first check-in's delta to — see the
     day-1 note above */
  const previous = i === 0 ? SEVERITY_MAX / 2 : DEMO_SEVERITY[i - 1];
  const severity = DEMO_SEVERITY[i];
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
 *
 * ⚠️ THE WINDOW IS CLIPPED AT BOTH ENDS, AND THE SECOND CLIP IS THE DEMO→REAL
 * HANDOFF. Nothing in the future has always been dropped — you cannot have
 * checked in on a day that has not arrived. Nothing BEFORE `view.start` is
 * dropped for the mirror-image reason, and it is what stops a demo walk
 * leaking into a real investigation: check in on the demo screen and the entry
 * is dated the frozen 17 Aug 2026, then answer step 4 with a real flare date
 * and the clock becomes `new Date()`. The seed disappears as it should, but
 * that one 17 Aug entry survived in the store — so the calendar opened on
 * AUGUST with a single stranded disc, today's ring was off in September where
 * nothing could see it, and the chart plotted a point weeks before day 1. A
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

  if (!view.isDemo) return recorded;

  return recorded.reduce(recordCheckIn, demoCheckIns(view.start, view.today));
}

/* ---------------------------------------------------------------------------
   CHECK-IN DETAIL — `Check-in detail` (556:1330 / 557:1353)

   The historical record for ONE day, opened from the Progress calendar. Nothing
   here is new state: a check-in already carries its severity, changes, note and
   photo, and the products are the ones the user owned on the day. The screen
   reads; the chat writes.
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
 * ⚠️ IT IS DERIVED FROM `addedOn`, NOT RECORDED BY THE CHECK-IN — and that is a
 * decision, flagged in `CheckInDetail`. The chat's three turns ask about skin,
 * not about products, so nothing writes a per-day product list; adding a fourth
 * turn would change a screen the frame draws. What the app does already know is
 * when each product entered the library, so "used on 5 Aug" is every product
 * added on or before it. A product added later cannot have been in that day's
 * routine, which is the error the screen would otherwise make on every day but
 * the most recent.
 *
 * ⚠️ THE COMP'S SECOND LINE — "Moisturizer · Applied Morning & Night" — HAS NO
 * DATA BEHIND IT. LUX stores no product category and no routine time; inventing
 * either would put a fact on screen that nothing in the app can be right about.
 * `CheckInDetail` writes the two facts the product actually carries instead.
 */
export function productsUsedOn(a: Answers, date: IsoDate): SavedProduct[] {
  return ownedProducts(a).filter((p) => p.addedOn <= date);
}
