/** Date helpers for the calendar. All dates are handled in LOCAL time. */

/** `YYYY-MM-DD` — the shape the answer store keeps, and what <input type="date"> used. */
export type IsoDate = string;

export function toIso(d: Date): IsoDate {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Parses as LOCAL midnight. `new Date("2026-08-02")` would parse as UTC and can
 *  land on the previous day west of Greenwich. */
export function fromIso(iso: IsoDate): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function sameDay(a: Date, b: Date): boolean {
  return toIso(a) === toIso(b);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** The visible 6x7 grid, Monday-first, padded with the neighbouring months. */
export function monthGrid(month: Date): Date[] {
  const first = startOfMonth(month);
  // getDay() is Sunday-first; shift so Monday === 0
  const lead = (first.getDay() + 6) % 7;
  const start = addDays(first, -lead);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function formatLong(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * "August 5, 2026" — the full month, for a screen whose whole subject is one
 * day. `formatLong` abbreviates ("Aug 5, 2026") because it is a detail on a
 * line of other facts; a page TITLE has the room to say the month.
 */
export function formatDay(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonth(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatFull(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/* ---------------------------------------------------------------------------
   SUNDAY-FIRST — the PROGRESS check-in calendar

   ⚠️ THE TWO CALENDARS IN LUX START THE WEEK ON DIFFERENT DAYS, and that is
   what the Figma frames do. `DateField` (03c Timing) is Monday-first; the
   PROGRESS check-in calendar (552:1255 / 554:1260) is Sunday-first — its header
   reads S M T W T F S and Aug 1 2026, a Saturday, sits in the LAST column.
   Neither frame is ambiguous, so both are reproduced rather than silently
   unified. Raise it in Figma: one product should pick one.
   -------------------------------------------------------------------------- */

export const WEEKDAYS_SUNDAY = ["S", "M", "T", "W", "T", "F", "S"];

/** Full names, because the initials repeat (S/T twice) and a screen reader
 *  reading "S, M, T, W, T, F, S" tells you nothing about which S you are on. */
export const WEEKDAY_NAMES_SUNDAY = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * The month laid out Sunday-first, as whole weeks of 7.
 *
 * ⚠️ PADS WITH `null`, NOT WITH THE NEIGHBOURING MONTHS. `monthGrid` above
 * shows the days either side because a date PICKER lets you reach them; this
 * calendar is a read-only record of one month, and the comp leaves those cells
 * empty. It also returns only the rows the month actually needs (5 or 6) rather
 * than a fixed 42, so a short month does not render a blank trailing week.
 */
export function monthGridSunday(month: Date): (Date | null)[] {
  const first = startOfMonth(month);
  const lead = first.getDay(); // 0 = Sunday, which is already what we want
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells = Math.ceil((lead + days) / 7) * 7;

  return Array.from({ length: cells }, (_, i) => {
    const dayOfMonth = i - lead + 1;
    return dayOfMonth >= 1 && dayOfMonth <= days
      ? new Date(first.getFullYear(), first.getMonth(), dayOfMonth)
      : null;
  });
}

/** Whole days from `a` to `b`, both normalised to local midnight. */
export function daysBetween(a: Date, b: Date): number {
  const from = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const to = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}
