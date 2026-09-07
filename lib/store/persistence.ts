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
 * shipped pre-filled. ⚠️ **THE ANSWERS COME BACK AGAIN NOW, AND THE DIFFERENCE
 * IS THE CLOCK** — see `FLOW_TTL_MS` below. What is unconditional is the rest:
 * no draft, no basket and no search field is ever written, so nothing the user
 * was in the middle of typing is waiting for the next reader.
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
 *
 * ⚠️ AND SINCE 7 Sep 2026 THERE IS A THIRD LIFETIME, NOT A SECOND LIST — the
 * flow answers now survive too, but only for `FLOW_TTL_MS`. Asked for
 * directly, and it is a real change to the rule above rather than a loophole
 * in it: `/investigation/start` WILL reopen with the user's own chips ticked
 * if they were ticked in the last day. What made the reverted build wrong was
 * that the state was FOREVER and belonged to nobody — a demo opened weeks
 * later greeted a new reader with a stranger's skin type, indistinguishable
 * from screens that ship pre-filled. A day-long window is the user's own
 * recent work and nothing else's.
 *
 * ⚠️ TWO KEYS, BECAUSE THERE ARE TWO LIFETIMES. Records never expire; flow
 * answers expire in a day. One blob with a mixed lifetime would have to either
 * drop the records with the answers or keep the answers with the records, and
 * both are wrong. `STORAGE_KEY` holds what was completed, `FLOW_STORAGE_KEY`
 * holds what is in progress, and neither read can damage the other.
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
 * The answers steps 1–4 collect — the slice that expires.
 *
 * ⚠️ THE FLOW'S ANSWERS, NOT EVERY CONTROL IN THE APP. What is here is what the
 * five steps ASKED and the recap reads back. What is deliberately absent is
 * every control that is mid-gesture rather than answered: `productDraft` and
 * `productQuery` (a tray half-filled), `checkBasket` and `checkQuery` (a basket
 * being built), `scan`, `viewingCheck` and `evidence`. Restoring a search field
 * with yesterday's query in it is the pre-filled-screen bug with none of the
 * value — the user did not answer a question there, they were typing.
 *
 * ⚠️ `products` IS NOT HERE AND IS NOT MISSING. Step 5's products are a
 * completed record: they persist above, under `PERSISTED_KEYS`, with no expiry,
 * because `/products` is specified to open populated. The step that collects
 * them is the one flow step whose answer outlives the day.
 */
export const FLOW_KEYS = [
  "start",
  "location",
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

/**
 * How long a set of flow answers outlives the tab.
 *
 * ⚠️ THE WINDOW IS SLIDING, MEASURED FROM THE LAST ANSWER AND NOT THE FIRST.
 * Every write re-stamps it, so "24 hours" means a day of not touching the
 * investigation rather than a day from the first chip — a walk through the flow
 * cannot time out underneath someone who is still walking it.
 *
 * ⚠️ IT IS ENFORCED ON READ, NOT BY A TIMER. Nothing sweeps storage on a
 * schedule; a stale envelope is dropped (and deleted) the next time anything
 * asks for it. A tab left open past the window keeps the answers it already has
 * in memory, which is correct — they are still that reader's own session.
 */
export const FLOW_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * ⚠️ A NEW KEY, AND `lux.investigation.v1` IS NEVER READ AGAIN.
 *
 * The legacy key holds whole-store snapshots written by the build that was
 * reverted — exactly the flow selections this module refuses to restore. It is
 * deleted on mount and never parsed. Bump this name rather than widening the
 * old one if the persisted shape ever changes again.
 */
export const STORAGE_KEY = "lux.records.v2";

/**
 * The expiring slice's own key.
 *
 * ⚠️ NOT `lux.investigation.v1` REVIVED. That key held the whole store with no
 * expiry and is still deleted unread on mount (see `LEGACY_STORAGE_KEY`); this
 * one holds an envelope — `{ savedAt, answers }` — and answers without a
 * readable `savedAt` are dropped rather than trusted, which is exactly what the
 * old key cannot offer. Bump the name rather than widening the shape.
 */
export const FLOW_STORAGE_KEY = "lux.flow.v1";

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

/** Narrow `Answers` to the slice that is allowed to outlive the tab for a day. */
export function pickFlow(answers: Answers): PersistedFlow {
  const out: PersistedFlow = {};
  if (answers.start?.length) out.start = answers.start;
  if (answers.location?.length) out.location = answers.location;
  if (answers.selfie) out.selfie = answers.selfie;
  if (answers["skin-type"]) out["skin-type"] = answers["skin-type"];
  if (answers.tendencies?.length) out.tendencies = answers.tendencies;
  if (answers.conditions?.length) out.conditions = answers.conditions;
  if (answers.conditionsOther) out.conditionsOther = answers.conditionsOther;
  if (answers.timing?.date || answers.timing?.status) out.timing = answers.timing;
  return out;
}

/**
 * Read the expiring slice back, dropping anything stale or malformed.
 *
 * ⚠️ THE ENVELOPE IS CHECKED BEFORE THE ANSWERS ARE. A payload with no
 * numeric `savedAt` is not "answers of unknown age", it is data this build did
 * not write — the reverted whole-store format is exactly that shape — so it is
 * refused outright rather than restored and shown to whoever opens the tab.
 *
 * `now` is passed in rather than read from the clock so the expiry is testable
 * and so the caller decides which "now" it means; see `readFlow`.
 */
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
  // ⚠️ A FUTURE STAMP IS STALE TOO. A clock that moved backwards (a timezone
  // fix, a corrected system time) would otherwise pin the slice open forever,
  // since `now - savedAt` never grows past the window.
  const age = now - savedAt;
  if (age < 0 || age > FLOW_TTL_MS) return {};

  const answers = data.answers;
  if (!isObject(answers)) return {};

  const out: PersistedFlow = {};
  if (isStringArray(answers.start)) out.start = answers.start;
  if (isStringArray(answers.location)) out.location = answers.location;
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

/**
 * Read the expiring slice. Never throws.
 *
 * ⚠️ A STALE ENVELOPE IS DELETED, NOT JUST IGNORED. Nothing else sweeps this
 * key, so leaving it there would keep one visitor's answers on the machine
 * indefinitely — expired, unreadable and still sitting in the browser. Reading
 * is the only moment the app can know it is past the window.
 */
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

/* ⚠️ THERE IS NO `clearFlow`, AND NOTHING NEEDS ONE. `reset()` empties the
   store, the provider's write effect runs on the emptied `answers`, and
   `writeFlow` removes the key when the slice comes back empty — the same path
   `writePersisted` takes for records. A second way to delete the key would be a
   second thing to keep in step with the first. */
