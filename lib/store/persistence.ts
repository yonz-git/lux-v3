import { DURATIONS, type BucketId, type CatalogProduct, type SavedProduct } from "@/features/products/products";
import type { SavedCheck } from "@/features/check/check";
import type { CheckIn } from "@/features/progress/progress";
import type { Answers } from "./answers";

/**
 * What survives a refresh — and, just as importantly, what does not.
 *
 * ⚠️ THIS IS THE CONTROLS / READOUTS SEAM, APPLIED TO STORAGE. `AGENTS.md`
 * already draws the line for what a screen may open with: "/progress and
 * /check deliberately open populated — they have nothing to select, and an
 * empty readout shows nothing", against "nothing is pre-selected, on any
 * screen". Persistence follows the SAME line, and for the same reason.
 *
 * ⚠️ AN EARLIER BUILD PERSISTED THE WHOLE STORE AND WAS REVERTED. Writing
 * every key meant a revisit restored `conditions`, `skin-type` and `start`,
 * so the flow opened with chips already ticked and read as though the screens
 * shipped pre-filled. That rule stands — see the ⚠️ in `InvestigationProvider`
 * — and nothing here weakens it: every flow selection is still in-memory only.
 *
 * What is written back is the set of things the user COMPLETED — a product
 * they added, a check they ran, a day they recorded, a finding they saved.
 * Restoring those cannot reproduce the bug, because no control renders from
 * them: they are the populated readouts `/products`, `/check` and `/progress`
 * are specified to show.
 *
 * The split is a TYPE, not a filter at the call site, so a new key has to be
 * placed deliberately. The old bug was invisible precisely because nothing in
 * the store said which keys were safe to keep.
 */
export const PERSISTED_KEYS = [
  "products",
  "checks",
  "checkIns",
  "savedFinding",
] as const;

export type PersistedKey = (typeof PERSISTED_KEYS)[number];

/** The saved slice. Every other key in `Answers` is transient by construction. */
export type PersistedAnswers = Pick<Answers, PersistedKey>;

/**
 * ⚠️ A NEW KEY, AND `lux.investigation.v1` IS NEVER READ AGAIN.
 *
 * The legacy key holds whole-store snapshots written by the build that was
 * reverted — exactly the flow selections this module refuses to restore. It is
 * deleted on mount and never parsed. Bump this name rather than widening the
 * old one if the persisted shape ever changes again.
 */
export const STORAGE_KEY = "lux.records.v2";

/* ---- shape guards -------------------------------------------------------
   Anything coming off disk was written by an older build, hand-edited, or
   truncated by a full disk. `CheckIn[]` in particular is read straight into
   `CheckInCalendar`, which indexes by date and would throw on a malformed row.
   A bad value is DROPPED, never repaired: half a check-in is not a record.  */

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function optionalString(v: unknown): boolean {
  return v === undefined || typeof v === "string";
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(isString);
}

/** `toIso` always writes `YYYY-MM-DD`; `parseIso` and the calendar assume it. */
function isIsoDate(v: unknown): v is string {
  return isString(v) && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function isCatalogProduct(v: unknown): v is CatalogProduct {
  return (
    isObject(v) &&
    isString(v.id) &&
    isString(v.name) &&
    isString(v.brand) &&
    isString(v.size) &&
    optionalString(v.description) &&
    optionalString(v.ingredients)
  );
}

const BUCKET_IDS: readonly BucketId[] = [
  "long-term",
  "recent",
  "new-addition",
  "not-sure",
];

function isSavedProduct(v: unknown): v is SavedProduct {
  // ⚠️ read the extra fields off the RECORD, not off a value already narrowed
  // to CatalogProduct — that type does not declare them and the checks would
  // not compile against it
  if (!isObject(v) || !isCatalogProduct(v)) return false;
  const row = v as Record<string, unknown>;
  return (
    isString(row.duration) &&
    (DURATIONS as readonly string[]).includes(row.duration) &&
    isString(row.bucket) &&
    (BUCKET_IDS as readonly string[]).includes(row.bucket) &&
    isString(row.addedOn)
  );
}

function isSavedCheck(v: unknown): v is SavedCheck {
  return (
    isObject(v) &&
    isString(v.id) &&
    isIsoDate(v.date) &&
    Array.isArray(v.products) &&
    v.products.every(isCatalogProduct)
  );
}

function isCheckIn(v: unknown): v is CheckIn {
  return (
    isObject(v) &&
    isIsoDate(v.date) &&
    typeof v.severity === "number" &&
    Number.isFinite(v.severity) &&
    (v.changes === undefined || isStringArray(v.changes)) &&
    optionalString(v.note) &&
    optionalString(v.photo) &&
    // ⚠️ absent is not empty — see the CheckIn.products doc comment
    (v.products === undefined || isStringArray(v.products))
  );
}

function isSavedFinding(v: unknown): v is NonNullable<Answers["savedFinding"]> {
  return (
    isObject(v) &&
    isString(v.id) &&
    isString(v.date) &&
    isString(v.summary) &&
    optionalString(v.pausing) &&
    optionalString(v.reviewOn)
  );
}

/** Narrow `Answers` to the slice that is allowed to outlive the tab. */
export function pickPersisted(answers: Answers): PersistedAnswers {
  const out: PersistedAnswers = {};
  if (answers.products) out.products = answers.products;
  if (answers.checks) out.checks = answers.checks;
  if (answers.checkIns) out.checkIns = answers.checkIns;
  if (answers.savedFinding) out.savedFinding = answers.savedFinding;
  return out;
}

/**
 * Read the saved slice back, dropping anything that does not typecheck at
 * runtime. Returns `{}` for absent, unparseable or wholly invalid data — the
 * caller cannot tell those apart and does not need to: all three mean "open
 * with the seeded demo", which is the cold-open the app already renders.
 */
export function parsePersisted(raw: string | null): PersistedAnswers {
  if (!raw) return {};

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!isObject(data)) return {};

  const out: PersistedAnswers = {};

  if (Array.isArray(data.products)) {
    const products = data.products.filter(isSavedProduct);
    if (products.length) out.products = products;
  }
  if (Array.isArray(data.checks)) {
    const checks = data.checks.filter(isSavedCheck);
    if (checks.length) out.checks = checks;
  }
  if (Array.isArray(data.checkIns)) {
    const checkIns = data.checkIns.filter(isCheckIn);
    if (checkIns.length) out.checkIns = checkIns;
  }
  if (isSavedFinding(data.savedFinding)) out.savedFinding = data.savedFinding;

  return out;
}

/** Serialise the saved slice. Never throws — storage can be full or blocked. */
export function writePersisted(answers: Answers): void {
  try {
    const slice = pickPersisted(answers);
    if (Object.keys(slice).length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slice));
  } catch {
    // quota exceeded, or storage unavailable (private mode) — the app is
    // fully functional without it, so a failed write is not worth surfacing
  }
}

/** Read the saved slice. Never throws. */
export function readPersisted(): PersistedAnswers {
  try {
    return parsePersisted(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return {};
  }
}
