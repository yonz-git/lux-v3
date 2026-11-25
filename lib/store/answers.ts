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
 */
export type Answers = Partial<{
  /** Step 1 — each symptom reported, and the places marked for it. */
  start: Partial<Record<Symptom, string[]>>;
  "skin-type": string;
  tendencies: string[];
  conditions: string[];
  /** free text for the "Other" option on 02c — required once Other is ticked */
  conditionsOther: string;
  /**
   * Step 1's free-text "Other" description — what the user typed under the face
   * diagram when the place has no pill on it.
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

  /** the products in the basket being built on /analyses/new. */
  checkBasket: CatalogProduct[];
  /** what /analyses/new's search field has typed in it */
  checkQuery: string;
  /** checks the user has actually run, newest first. The seeded history in
   *  lib/check.ts sits BELOW these rather than in here — a demo row is not
   *  something the user did. */
  checks: SavedCheck[];
  /** which check /analyses/results is showing; absent means the newest */
  viewingCheck: string;

  /**
   * The user's own answer to "did you start this before or after the
   * reaction?", keyed by product id.
   */
  evidence: Record<string, "associated" | "tolerated">;

  /**
   * The finding the user saved — § 09's "investigation record", which is what
   * PROGRESS shows.
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

  /** the check-ins the user has actually recorded, oldest first. One per day —
   *  answering again on a day already recorded REPLACES that day's entry, so
   *  the calendar can never show two discs on one square. The seeded demo
   *  series in lib/progress.ts sits alongside these rather than in here, the
   *  same split `checks` makes against the seeded check history. */
  checkIns: CheckIn[];
}>;

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

/** Where the answers are saved between visits. */
export const STORAGE_KEY = "lux.answers.v3";

/** Mid-task state that a new visit must not reopen: drafts, queries, the
 *  open check. Everything else is saved. */
export const TRANSIENT_KEYS = [
  "productDraft",
  "scan",
  "productQuery",
  "checkBasket",
  "checkQuery",
  "viewingCheck",
] as const satisfies readonly (keyof Answers)[];

/** Every key an earlier build saved in the browser; deleted on load. */
export const RETIRED_STORAGE_KEYS = [
  "lux.investigation.v1",
  "lux-start-other-description",
  "lux.flow.v1",
  "lux.flow.v2",
  "lux.records.v2",
] as const;
