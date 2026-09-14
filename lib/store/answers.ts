import type { StepId } from "@/features/my-skin/flow";
import type { Symptom } from "@/features/my-skin/safety";
import type { CatalogProduct, ProductDraft, SavedProduct } from "@/features/products/products";
import type { SavedCheck } from "@/features/check/check";
import type { CheckIn } from "@/features/progress/progress";

/**
 * Everything the user has answered so far.
 *
 * Keyed by StepId so a screen and its answer cannot drift apart. Single-select
 * steps store a string, multi-select steps store an array.
 *
 * ⚠️ `tendencies` is the one exception: it lives under the `skin-type` step
 * (both questions are asked on that one screen — see SkinType.tsx) but keeps
 * its own answer key since it is a separate multi-select answer.
 *
 * ⚠️ AND `start` IS THE ONE MAP — see its own note.
 */
export type Answers = Partial<{
  /**
   * Step 1 — each symptom reported, and the places marked for it.
   *
   * ⚠️ A MAP, NOT TWO LISTS, AS OF 14 Sep 2026. Step 1 stored its symptoms here
   * and its places in `location`, two unrelated sets, so "redness on the
   * forehead, dryness on the chin" could only ever come back as every symptom
   * on every place. The screen now asks for the places ONE SYMPTOM AT A TIME
   * (`StartInvestigation.tsx`), and the answer keeps the pairing. `location` is
   * GONE rather than kept in step with this: the union every older reader
   * wanted is `areasOf`, derived, so the two cannot disagree.
   *
   * ⚠️ NO SYMPTOM IS STORED WITH AN EMPTY LIST. `withAreas` is the only writer:
   * the first place creates a symptom's entry and removing the last deletes
   * it, so "is this symptom reported" and "does it have somewhere to be" are
   * one question, and `isComplete` asks it once.
   *
   * Keys keep the order the symptoms were reported in. Values are the region
   * ids plus `Whole face`, `Neck` and `Other`, exactly as `location` held them.
   */
  start: Partial<Record<Symptom, string[]>>;
  "skin-type": string;
  tendencies: string[];
  conditions: string[];
  /** free text for the "Other" option on 02c — required once Other is ticked */
  conditionsOther: string;
  /**
   * Step 1's free-text "Other" description — what the user typed under the face
   * diagram when the place has no pill on it.
   *
   * ⚠️ IT LIVED IN ITS OWN localStorage KEY UNTIL 8 Sep 2026, OUTSIDE THIS
   * STORE, and that is why the recap showed no sign of it: a value nothing else
   * can read is a value the rest of the app has to pretend was never given.
   * It is an answer to step 1 like any other, so it sits with them — the same
   * shape `conditionsOther` has for step 3's typed condition. It does not gate
   * Continue: a symptom with a place does, and a place given only in words is
   * that symptom's `Other` chip plus this sentence.
   */
  locationOther: string;
  selfie: string;
  timing: { status?: string; date?: string };
  /** step 5 — the products the user has added, and what the hub reads */
  products: SavedProduct[];
  /** the product currently being added, while the add-product tray walks it
   *  from "is this it?" to "how long have you used it?" */
  productDraft: ProductDraft;
  /**
   * The scan view's capture, mirroring `selfie`. The viewfinder is a
   * placeholder, so this only records THAT a capture happened — which is what
   * unlocks Continue and reveals the match.
   */
  scan: string;
  /** what the tray's search field currently has typed in it */
  productQuery: string;

  /* ---- CHECK — the compatibility check off the Check tab -------------------
     ⚠️ NOT AN INVESTIGATION STEP, and it has no `StepId`. CHECK carries no
     progress track and no `Save & exit`, which is exactly what makes it not one
     — see lib/check.ts. It lives in this store anyway because the store is the
     app's only state and the basket has to survive the walk from /check/new to
     /check/analyzing to /check/results. */

  /** the products in the basket being built on /check/new.
   *
   *  ⚠️ THE PRODUCTS THEMSELVES, NOT IDS. `/check/new` searches Open Beauty
   *  Facts now, exactly as the PRODUCTS tray does, so a basket row can be a
   *  live result that exists nowhere in `CATALOG` — `productById` would return
   *  undefined and the row would vanish between /check/new and /check/results.
   *  Scores are still never stored; see lib/check.ts. */
  checkBasket: CatalogProduct[];
  /** what /check/new's search field has typed in it */
  checkQuery: string;
  /** checks the user has actually run, newest first. The seeded history in
   *  lib/check.ts sits BELOW these rather than in here — a demo row is not
   *  something the user did. */
  checks: SavedCheck[];
  /** which check /check/results is showing; absent means the newest */
  viewingCheck: string;

  /* ---- THE ANALYSIS — the culprit finder off step 5 ----------------------
     ⚠️ NOT STEPS, THOUGH THEY LIVE UNDER `/investigation`.
     `/investigation/{evidence,analyzing,findings}` are pushed result views with no progress track and no
     `Save & exit`, the same standing `/check/results` has — see
     `features/my-skin/analysis.ts`. They live under `/investigation` because
     they report on what those five steps collected, not because they are a
     sixth one. */

  /**
   * The user's own answer to "did you start this before or after the
   * reaction?", keyed by product id.
   *
   * ⚠️ IT IS ONLY EVER ASKED WHERE THE TIMELINE IS GENUINELY AMBIGUOUS. The
   * brief: "Do not force the user to label every product suspicious or safe.
   * Show a compact confirmation list only when the AI's interpretation is
   * ambiguous." `deriveEvidence` decides that; `needsConfirmation` is the list.
   * A product missing from this map is not unanswered, it is unambiguous.
   */
  evidence: Record<string, "associated" | "tolerated">;

  /* ⚠️ THERE IS NO `routineNotUsed` KEY, AND THAT IS DELIBERATE. It existed so
     the user could declare "I don't use a sunscreen" and thereby satisfy a GATE
     that refused to analyse without one. The gate is gone — a missing cleanser
     or sunscreen is a reminder now, not a requirement — so there is nothing for
     the declaration to unlock and nothing worth storing. See `forgottenRoles`
     in `features/my-skin/analysis.ts`. */

  /**
   * The finding the user saved — § 09's "investigation record", which is what
   * PROGRESS shows.
   *
   * ⚠️ THE SUMMARY IS A STORED STRING, NOT A RE-DERIVATION. `recordSummary`
   * builds it at the moment the user saves. A record that recomputed itself
   * would silently change after the user edited their products, which is the
   * opposite of what a record is for — and it keeps `progress.ts` from
   * importing the analysis.
   *
   * ⚠️ IT IS A RECORD, NOT A DIAGNOSIS, and the screen that shows it says so.
   */
  savedFinding: {
    id: string;
    /** ISO date the finding was saved */
    date: string;
    summary: string;
    /** § 10 — the product being paused, if the user started an observation */
    pausing?: string;
    /** ISO date the observation is due to be reviewed */
    reviewOn?: string;
  };

  /* ---- THE DAILY CHECK-IN — the PROGRESS section -------------------------
     ⚠️ NOT AN INVESTIGATION STEP EITHER, and not part of CHECK. It is one
     question asked from `/progress`, and `/progress` is the only screen that
     reads it back — see components/CheckIn.tsx for why it does not live under
     the Check tab the handoff nominally assigns it to. */

  /** the check-ins the user has actually recorded, oldest first. One per day —
   *  answering again on a day already recorded REPLACES that day's entry, so
   *  the calendar can never show two discs on one square. The seeded demo
   *  series in lib/progress.ts sits alongside these rather than in here, the
   *  same split `checks` makes against the seeded check history. */
  checkIns: CheckIn[];
}>;

/**
 * ⚠️ EXCLUSIVE OPTIONS — "None", "Not sure", "Prefer not to say", "No change".
 *
 * These are answers ABOUT the list, not items in it. They stay CHECKBOXES and
 * keep `role="checkbox"` — the group is still multi-select — but they clear
 * everything else. Never switch just those rows to radios: mixing circles and
 * squares in one group tells the user the whole group is single-select.
 *
 * ⚠️ "No change" IS THE DAILY CHECK-IN'S, and it was missing. `Check-in chat`
 * (555:1268) ends turn 2 with it, and it is the same species as "None" — you
 * cannot have noticed less redness AND noticed no change. It was not in this
 * list, so it toggled like an ordinary symptom and the screen happily recorded
 * "More redness, More itching, No change". The list is the only place that
 * knowledge lives, which is exactly why the bug was invisible in the screen's
 * own code.
 */
export const EXCLUSIVE_OPTIONS = [
  "None",
  "Not sure",
  "Prefer not to say",
  "No change",
];

export function isExclusive(option: string): boolean {
  return EXCLUSIVE_OPTIONS.includes(option);
}

/**
 * Toggle one option inside a multi-select group, applying the exclusive rules:
 *
 *   taps a normal option    -> deselect every exclusive, keep the rest
 *   taps an exclusive       -> deselect everything else, including the other
 *                              exclusives (they are mutually exclusive)
 *   unchecks an exclusive   -> just unchecks it. Do NOT restore the previous
 *                              selections.
 */
export function toggleMulti(current: string[], option: string): string[] {
  const selected = current.includes(option);

  if (isExclusive(option)) {
    // unchecking an exclusive clears it and restores nothing
    return selected ? [] : [option];
  }

  const withoutExclusives = current.filter((o) => !isExclusive(o));
  return selected
    ? withoutExclusives.filter((o) => o !== option)
    : [...withoutExclusives, option];
}

/** Step 1's symptoms, in the order they were reported. */
export function symptomsOf(a: Answers): Symptom[] {
  return Object.keys(a.start ?? {}) as Symptom[];
}

/**
 * Every place step 1 marked, across all its symptoms, earliest first — what
 * `location` used to hold, derived now so it can never disagree with `start`.
 */
export function areasOf(a: Answers): string[] {
  return [
    ...new Set(Object.values(a.start ?? {}).flatMap((areas) => areas ?? [])),
  ];
}

/**
 * Step 1's answer with one symptom's places replaced — the ONLY way `start` is
 * written, so the rule that no symptom is stored without a place lives in one
 * spot: an empty list removes the symptom rather than storing it.
 */
export function withAreas(
  start: Answers["start"],
  symptom: Symptom,
  areas: string[],
): NonNullable<Answers["start"]> {
  if (areas.length > 0) return { ...start, [symptom]: areas };
  return Object.fromEntries(
    Object.entries(start ?? {}).filter(([s]) => s !== symptom),
  );
}

/**
 * ⚠️ A KEY THAT IS ONLY EVER DELETED, NEVER READ.
 *
 * It holds whole-store snapshots written by an earlier build that persisted
 * EVERYTHING; opening the prototype then showed a previous visit's selections
 * as though the screens shipped pre-filled. The provider deletes it on mount.
 *
 * ⚠️ DO NOT REPOINT PERSISTENCE AT IT. The current store does persist — but
 * only completed records, under `STORAGE_KEY` in `lib/store/persistence.ts`,
 * and never a flow selection. This key's contents are exactly the data that
 * rule exists to keep off the screen. Remove it once it has shipped for long
 * enough that no stale data remains.
 */
export const LEGACY_STORAGE_KEY = "lux.investigation.v1";

/**
 * ⚠️ THE SECOND KEY THAT IS ONLY EVER DELETED — step 1's own, orphaned 8 Sep
 * 2026.
 *
 * The free-text "Other" description used to be written straight to this key by
 * `StartInvestigation`, outside the store, and nothing else could read it: that
 * is why the profile recap showed the `Other` chip with none of the words. The
 * answer is `locationOther` now and this key is never read again — but a typed
 * sentence left behind in a visitor's browser is the same dead data
 * `LEGACY_STORAGE_KEY` exists to sweep up, and it has no expiry of its own to
 * do it. Deleted on mount alongside it.
 */
export const LEGACY_START_OTHER_KEY = "lux-start-other-description";

/**
 * ⚠️ THE THIRD KEY THAT IS ONLY EVER DELETED — the flow answers' first
 * envelope, retired 14 Sep 2026.
 *
 * `lux.flow.v1` holds step 1 in its old shape: `start` as a list of symptoms
 * beside a separate `location` list. `start` is a map now, and the persistence
 * rule is to bump the key rather than widen the guard (`FLOW_STORAGE_KEY`), so
 * this build writes `lux.flow.v2` and never reads v1. Nothing reading v1 means
 * nothing ever notices it has expired, so its answers would sit in a visitor's
 * browser indefinitely. Deleted on mount alongside the two above.
 */
export const LEGACY_FLOW_V1_KEY = "lux.flow.v1";

export type AnswerKey = keyof Answers & StepId;
