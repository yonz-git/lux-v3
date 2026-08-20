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
