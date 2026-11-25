/**
 * What the PROGRESS section reads.
 *
 * Figma `Progress — empty` (551:1196 / 551:1231) and `Progress — active`
 * (552:1236 / 554:1252), documented by `HANDOFF — INVESTIGATION & PROGRESS`
 * (559:1376).
 */
import type { Answers } from "@/lib/store/answers";
import { ownedProducts } from "@/features/products/library";
import { type IsoDate, addDays, daysBetween, fromIso, toIso } from "@/lib/date";
import type { SavedProduct } from "@/features/products/products";
import {
  FACE_REGION_IDS,
  type SymptomPlaces,
} from "@/features/my-skin/components/FaceDiagram";
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
 */
export type CheckIn = {
  date: IsoDate;
  severity: number;
  changes?: string[];
  /** Turn 1's direction, kept so `Check-in detail` can colour the changes by it. */
  direction?: "better" | "same" | "worse";
  note?: string;
  /** the capture is a placeholder, so this records THAT a photo was taken */
  photo?: string;
  /**
   * The products this record says were in use that day — ids into the user's
   * own library. Written by `Check-in detail`, which edits the list in place.
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

/**
 * Whether there is an investigation to show — the one rule both hubs use.
 * Step 4's date is the last answer the flow asks for, so by then the skin
 * type and symptoms are answered too.
 */
export function hasInvestigation(a: Answers): boolean {
  return investigationStart(a) !== null;
}

/** Everything the Progress screen needs, from the user's answers. */
export type ProgressView = {
  start: Date;
  today: Date;
  skinType?: string;
  tendencies?: string[];
  /** Step 3's answer, read exactly as the profile recap reads it. */
  conditions: string[];
  status?: string;
};

/** Before step 4 is answered the start is today, so nothing reads as past. */
export function progressView(a: Answers, today: Date): ProgressView {
  return {
    start: investigationStart(a) ?? today,
    today,
    skinType: a["skin-type"],
    tendencies: a.tendencies,
    conditions: conditionsList(a),
    status: a.timing?.status,
  };
}

/** 1-based, so the day the investigation started is "Day 1", not "Day 0". */
export function dayNumber(start: Date, today: Date): number {
  return daysBetween(start, today) + 1;
}

/** The chart's window: today and the 13 days before it — the most days that
 *  still label one by one on a phone ("it should show each day"). */
export const TREND_DAYS = 14;

export const TREND_BANDS = [
  { label: "Mild", from: 0, to: 3.5 },
  { label: "Moderate", from: 3.5, to: 6.5 },
  { label: "Severe", from: 6.5, to: SEVERITY_MAX },
] as const;

export type TrendBand = (typeof TREND_BANDS)[number]["label"];

function bandIndex(severity: number): number {
  const i = TREND_BANDS.findIndex((b) => severity <= b.to);
  return i === -1 ? TREND_BANDS.length - 1 : i;
}

export function trendBand(severity: number): TrendBand {
  return TREND_BANDS[bandIndex(severity)].label;
}

/** Where a severity sits on the chart: 0 at the floor, 1 at the top, each band
 *  a third of the height. */
export function trendHeight(severity: number): number {
  const clamped = Math.min(Math.max(severity, 0), SEVERITY_MAX);
  const i = bandIndex(clamped);
  const band = TREND_BANDS[i];
  return (i + (clamped - band.from) / (band.to - band.from)) / TREND_BANDS.length;
}

/**
 * The window's days, oldest first. It opens on the first check-in while the
 * check-ins span less than the window, so a new investigation reads from the
 * left and fills in day by day; after that it is the last `TREND_DAYS`, ending
 * today.
 */
export function trendDays(today: Date, checkIns: readonly CheckIn[] = []): Date[] {
  const latestStart = addDays(today, -(TREND_DAYS - 1));
  const first = checkIns
    .map((c) => fromIso(c.date))
    .filter((d): d is Date => d !== null && daysBetween(d, today) >= 0)
    .sort((a, b) => a.getTime() - b.getTime())[0];
  const start = first && daysBetween(latestStart, first) > 0 ? first : latestStart;
  return Array.from({ length: TREND_DAYS }, (_, i) => addDays(start, i));
}

/** The one-line reading over the chart — "From moderate to mild in 10 days". */
export function trendReading(checkIns: CheckIn[]): string | null {
  if (checkIns.length < 2) return null;

  const first = checkIns[0];
  const last = checkIns[checkIns.length - 1];
  const from = fromIso(first.date);
  const to = fromIso(last.date);
  if (!from || !to) return null;

  const days = daysBetween(from, to) + 1;
  const a = trendBand(first.severity).toLowerCase();
  const b = trendBand(last.severity).toLowerCase();

  return a === b ? `Steady at ${a} over ${days} days` : `From ${a} to ${b} in ${days} days`;
}

/** A product that entered the routine inside the window — the chart's dashed
 *  line. Read from `addedOn`, the one start date LUX keeps. */
export type TrendEvent = { date: IsoDate; name: string };

export function trendEvents(
  products: readonly { name: string; addedOn: string }[],
  days: readonly Date[]
): TrendEvent[] {
  const inWindow = new Set(days.map(toIso));
  return products
    .filter((p) => inWindow.has(p.addedOn))
    .map((p) => ({ date: p.addedOn, name: p.name }))
    .sort((x, y) => x.date.localeCompare(y.date));
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

/** The newest recorded check-in, or null. The list is kept oldest-first. */
export function latestCheckIn(list: CheckIn[]): CheckIn | null {
  return list.length > 0 ? list[list.length - 1] : null;
}

/**
 * Each symptom and the places marked for it — what the face card on
 * `/myskin` draws as callouts: a pill at the face's edge per symptom, with a
 * line to each of its places.
 */
export function symptomPlaces(a: Answers): SymptomPlaces {
  return a.start ?? {};
}

/**
 * Every place across the symptoms, split for the face card — the regions that
 * are pills on the face, and the rest (`Whole face`, `Neck`, `Other`), which
 * are chips under it.
 */
export function faceLocations(places: SymptomPlaces): {
  faceRegions: string[];
  otherLocations: string[];
} {
  const locations = [
    ...new Set(Object.values(places).flatMap((p) => p ?? [])),
  ];
  return {
    faceRegions: locations.filter((l) => FACE_REGION_IDS.includes(l)),
    otherLocations: locations.filter((l) => !FACE_REGION_IDS.includes(l)),
  };
}

/**
 * The check-ins that carry a photo, NEWEST first — the profile card's latest
 * photos and the gallery they open (`PhotoGallery`).
 */
export function photoDiary(checkIns: CheckIn[]): CheckIn[] {
  return checkIns.filter((c) => c.photo).reverse();
}

/* THE DAILY CHECK-IN */

/**
 * The five answers to turn 1 — `Check-in chat` (555:1268) draws these exact
 * labels, in this order.
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

/** Today's absolute severity, from a relative answer. */
export function severityAfter(previous: CheckIn | null, delta: number): number {
  const base = previous ? previous.severity : SEVERITY_MAX / 2;
  return Math.min(SEVERITY_MAX, Math.max(0, base + delta));
}

/**
 * Turn 2 — `That's good to hear! Any specific changes you've noticed?` and its
 * chips, both of which depend on turn 1's direction.
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

/** Add one check-in to the recorded list, oldest first. */
export function recordCheckIn(current: CheckIn[], entry: CheckIn): CheckIn[] {
  return [...current.filter((c) => c.date !== entry.date), entry].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  );
}

/** What `/myskin` plots: the user's own check-ins since the start, oldest first. */
export function checkInsFor(a: Answers, view: ProgressView): CheckIn[] {
  const recorded = (a.checkIns ?? []).filter((c) => {
    const day = fromIso(c.date) ?? view.today;
    return (
      daysBetween(day, view.today) >= 0 && daysBetween(view.start, day) >= 0
    );
  });

  return recorded.reduce(recordCheckIn, []);
}

/* SKIN HEALTH — `/myskin/health`

   The latest reading over a chosen window, the range and the count inside it,
   and the one-line reading. Every figure comes from the user's check-ins; a
   window never reaches back before the investigation started. */

/** The screen's three windows. One check-in a day, so the shortest is a week. */
export const HEALTH_WINDOWS = [
  { label: "Week", days: 7 },
  { label: "Month", days: 30 },
  { label: "All", days: null },
] as const;

/** The window's first day: `days` back from today, or the start for `All`. */
export function windowStart(view: ProgressView, days: number | null): Date {
  if (days === null) return view.start;
  const from = addDays(view.today, 1 - days);
  return daysBetween(view.start, from) >= 0 ? from : view.start;
}

/** The check-ins from `from` to today, oldest first. */
export function checkInsSince(list: CheckIn[], from: Date): CheckIn[] {
  return list.filter((c) => {
    const day = fromIso(c.date);
    return day !== null && daysBetween(from, day) >= 0;
  });
}

/** The lowest and highest severity in a list, or null when it is empty. */
export function severityRange(
  list: CheckIn[]
): { low: number; high: number } | null {
  if (list.length === 0) return null;
  const values = list.map((c) => c.severity);
  return { low: Math.min(...values), high: Math.max(...values) };
}

/** Turn 1's answer, as the pill under the latest reading says it. */
export function directionLabel(
  direction: CheckIn["direction"]
): string | null {
  if (direction === "better") return "Better than last time";
  if (direction === "same") return "Same as last time";
  if (direction === "worse") return "Worse than last time";
  return null;
}

/* CHECK-IN DETAIL — `Check-in detail` (556:1330 / 557:1353)

   The historical record for ONE day, opened from the Progress calendar. The
   severity, the changes, the note and the photo are the ones the chat wrote —
   the screen reads them and states nothing it cannot derive. */

/** One day's record, or null if the user did not check in that day. */
export function checkInOn(list: CheckIn[], date: IsoDate): CheckIn | null {
  return list.find((c) => c.date === date) ?? null;
}

/**
 * The word beside the number — `Check-in detail` writes "Moderate" against
 * "6 / 10".
 */
export function severityLabel(severity: number): string {
  if (severity <= 1) return "Clear";
  if (severity <= 3) return "Mild";
  if (severity <= 6) return "Moderate";
  if (severity <= 8) return "Severe";
  return "Very severe";
}

/** `card · products used` — what was in the routine on the day of a check-in. */
export function productsUsedOn(a: Answers, date: IsoDate): SavedProduct[] {
  return ownedProducts(a).filter((p) => p.addedOn <= date);
}

/**
 * What the record's `Products used` card actually lists — the user's own list
 * once they have edited one, the `addedOn` derivation until then.
 */
export function productsForCheckIn(a: Answers, entry: CheckIn): SavedProduct[] {
  if (!entry.products) return productsUsedOn(a, entry.date);
  const ids = new Set(entry.products);
  return ownedProducts(a).filter((p) => ids.has(p.id));
}

/** The store update for one edit of a day's product list. */
/**
 * The store update for one edit of a day's NOTE — the same reducer shape
 * `editProductsUsed` has, and for the same two reasons: the updater form so two
 * edits in one tick cannot start from the same rendered snapshot, and the
 * fallback to `entry` so editing a day writes the whole record (severity,
 * changes, products, photo) rather than a note-only entry that drops the rest
 * of the day.
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
 * The stored answer when there is one. Otherwise it is derived from this
 * severity against the previous record's, or against `SEVERITY_MAX / 2` for
 * the first.
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
