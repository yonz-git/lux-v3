import { DURATIONS, type BucketId, type CatalogProduct, type SavedProduct } from "@/features/products/products";
import { SYMPTOMS } from "@/features/my-skin/safety";
import type { SavedCheck } from "@/features/check/check";
import type { CheckIn } from "@/features/progress/progress";
import type { Answers } from "./answers";

/** What survives a refresh — and, just as importantly, what does not. */
export const PERSISTED_KEYS = [
  "products",
  "checks",
  "checkIns",
  "savedFinding",
] as const;

export type PersistedKey = (typeof PERSISTED_KEYS)[number];

/** The saved slice. Every other key in `Answers` is transient by construction. */
export type PersistedAnswers = Pick<Answers, PersistedKey>;

/** The answers steps 1–4 collect — the slice that expires. */
export const FLOW_KEYS = [
  "start",
  "locationOther",
  "selfie",
  "skin-type",
  "tendencies",
  "conditions",
  "conditionsOther",
  "timing",
] as const;

export type FlowKey = (typeof FLOW_KEYS)[number];

/** The expiring slice. */
export type PersistedFlow = Pick<Answers, FlowKey>;

/** How long a set of flow answers outlives the tab. */
export const FLOW_TTL_MS = 24 * 60 * 60 * 1000;

export const STORAGE_KEY = "lux.records.v2";

/** The expiring slice's own key. */
export const FLOW_STORAGE_KEY = "lux.flow.v2";

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

function dated(product: SavedProduct): SavedProduct {
  return { ...product, addedOn: product.addedOn.slice(0, 10) };
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
    (v.direction === undefined ||
      v.direction === "better" ||
      v.direction === "same" ||
      v.direction === "worse") &&
    optionalString(v.note) &&
    optionalString(v.photo) &&
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
    const products = data.products.filter(isSavedProduct).map(dated);
    if (products.length || data.products.length === 0) out.products = products;
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

/* ---- the expiring slice -------------------------------------------------
   The flow's own answers, under their own key, behind their own clock. Every
   function here is the record slice's counterpart and behaves the same way in
   the same failure: a bad value is dropped, never repaired, and a failed write
   is never surfaced.                                                        */

/** Step 4's answer — a status word and an ISO date, both optional on their own. */
function isTiming(v: unknown): v is NonNullable<Answers["timing"]> {
  return (
    isObject(v) &&
    optionalString(v.status) &&
    (v.date === undefined || isIsoDate(v.date))
  );
}

/**
 * Step 1's answer: every key a symptom the screen offers, every value a
 * non-empty list of places. `withAreas` never writes an empty list, so one on
 * disk means the data is not this build's.
 */
function isSymptomAreas(v: unknown): v is NonNullable<Answers["start"]> {
  return (
    isObject(v) &&
    Object.entries(v).every(
      ([symptom, areas]) =>
        (SYMPTOMS as readonly string[]).includes(symptom) &&
        isStringArray(areas) &&
        areas.length > 0
    )
  );
}

/** Narrow `Answers` to the slice that is allowed to outlive the tab for a day. */
export function pickFlow(answers: Answers): PersistedFlow {
  const out: PersistedFlow = {};
  if (answers.start && Object.keys(answers.start).length > 0) {
    out.start = answers.start;
  }
  if (answers.locationOther) out.locationOther = answers.locationOther;
  if (answers.selfie) out.selfie = answers.selfie;
  if (answers["skin-type"]) out["skin-type"] = answers["skin-type"];
  if (answers.tendencies?.length) out.tendencies = answers.tendencies;
  if (answers.conditions?.length) out.conditions = answers.conditions;
  if (answers.conditionsOther) out.conditionsOther = answers.conditionsOther;
  if (answers.timing?.date || answers.timing?.status) out.timing = answers.timing;
  return out;
}

/** Read the expiring slice back, dropping anything stale or malformed. */
export function parseFlow(raw: string | null, now: number): PersistedFlow {
  if (!raw) return {};

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!isObject(data)) return {};

  const savedAt = data.savedAt;
  if (typeof savedAt !== "number" || !Number.isFinite(savedAt)) return {};
  const age = now - savedAt;
  if (age < 0 || age > FLOW_TTL_MS) return {};

  const answers = data.answers;
  if (!isObject(answers)) return {};

  const out: PersistedFlow = {};
  if (isSymptomAreas(answers.start)) out.start = answers.start;
  if (isString(answers.locationOther)) out.locationOther = answers.locationOther;
  if (isString(answers.selfie)) out.selfie = answers.selfie;
  if (isString(answers["skin-type"])) out["skin-type"] = answers["skin-type"];
  if (isStringArray(answers.tendencies)) out.tendencies = answers.tendencies;
  if (isStringArray(answers.conditions)) out.conditions = answers.conditions;
  if (isString(answers.conditionsOther)) out.conditionsOther = answers.conditionsOther;
  if (isTiming(answers.timing)) out.timing = answers.timing;

  return out;
}

/** Serialise the expiring slice, re-stamping the window. Never throws. */
export function writeFlow(answers: Answers, now: number): void {
  try {
    const slice = pickFlow(answers);
    if (Object.keys(slice).length === 0) {
      window.localStorage.removeItem(FLOW_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      FLOW_STORAGE_KEY,
      JSON.stringify({ savedAt: now, answers: slice })
    );
  } catch {
    // quota exceeded, or storage unavailable (private mode) — the flow works
    // perfectly well without it, so a failed write is not worth surfacing
  }
}

/** Read the expiring slice. Never throws. */
export function readFlow(now: number): PersistedFlow {
  try {
    const raw = window.localStorage.getItem(FLOW_STORAGE_KEY);
    const flow = parseFlow(raw, now);
    if (raw && Object.keys(flow).length === 0) {
      window.localStorage.removeItem(FLOW_STORAGE_KEY);
    }
    return flow;
  } catch {
    return {};
  }
}

