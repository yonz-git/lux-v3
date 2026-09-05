/**
 * The ingredient vocabulary — what the app knows how to reason about, and the
 * only place that knowledge lives.
 *
 * ⚠️ THIS WAS `features/check/check.ts`'s AND IT IS SHARED NOW. The placement
 * rule in AGENTS.md is "a file goes in `features/<section>/` unless two
 * different sections already use it", and two now do: CHECK asks whether a
 * product suits the user's skin BEFORE they buy it, and `my-skin`'s analysis
 * asks which of the products they ALREADY use is associated with a recorded
 * reaction. Opposite directions, same ingredient list.
 *
 * ⚠️ AND THE PENALTIES DELIBERATELY DID NOT COME WITH IT. They are still in
 * `check.ts`, as `SCORING`, and the analysis cannot reach them. The weights are
 * tuned to reproduce the five scores `Check results` (476:2841) draws — which
 * is the right shape for a compatibility SCORE and the wrong basis for a causal
 * CLAIM. A number tuned against a comp must never end up behind a sentence
 * about what caused someone's reaction. `advice` stayed for the same reason: it
 * is prospective how-to-use copy ("use only at night, start with 2x per week"),
 * which is CHECK's question, not the analysis's.
 *
 * So what lives here is the part that is true regardless of which direction you
 * ask from: what an ingredient is CALLED, what it DOES to skin, which INCI
 * words mean it, and which pairs should not share a routine.
 */
import type { CatalogProduct } from "@/features/products/products";

export type ActiveId =
  | "retinol"
  | "salicylic-acid"
  | "niacinamide"
  | "alcohol-denat"
  | "fragrance"
  | "sulfates";

export type Active = {
  /** the short form, for an ingredient tag on a results card */
  label: string;
  /** the full form, for an `Ingredients of concern` entry */
  name: string;
  /**
   * Why it is a concern.
   *
   * ⚠️ HAND-WRITTEN, AND NOT A CITABLE AUTHORITY. The product brief requires
   * every hypothesis to explain why an ingredient is a plausible suspect;
   * these strings are what carries that today. CosIng — the European
   * Commission's cosmetic ingredient database, free and public — is the source
   * that should back them and is wired nowhere in the build. See
   * "The ingredient data" in `docs/decisions.md`. Read as: good enough for a
   * prototype to explain itself with, not good enough to ship a causal claim on.
   */
  concern: string;
};

export const ACTIVES: Record<ActiveId, Active> = {
  "salicylic-acid": {
    label: "Salicylic Acid 2%",
    name: "Salicylic Acid (BHA)",
    concern:
      "An exfoliating acid. Over-use thins the barrier and shows up as stinging and flaking on sensitive skin.",
  },
  retinol: {
    label: "Retinol",
    name: "Retinol",
    concern:
      "A potent active. Redness, dryness and peeling in the first weeks are common, and more pronounced on sensitive skin.",
  },
  "alcohol-denat": {
    label: "Alcohol Denat.",
    name: "Alcohol Denat.",
    concern:
      "A drying solvent, high in the ingredient list of many serums. Commonly associated with tightness and redness.",
  },
  fragrance: {
    label: "Fragrance",
    name: "Fragrance (Parfum)",
    concern:
      "One of the most common causes of contact dermatitis. Reaction timing often aligns with product introduction.",
  },
  sulfates: {
    label: "SLS",
    name: "Sodium Lauryl Sulfate (SLS)",
    concern:
      "Known irritant for sensitive skin. Commonly associated with redness and dryness.",
  },
  niacinamide: {
    label: "Niacinamide",
    name: "Niacinamide",
    concern: "",
  },
};

/**
 * What each catalogue product contains. Only what the app reasons about —
 * this is not an INCI list.
 *
 * A product missing from this map falls through to `activesFromInci`, and if
 * that finds nothing either it contains nothing worth naming. Silence should
 * not be a penalty.
 */
const PRODUCT_ACTIVES: Record<string, ActiveId[]> = {
  "the-ordinary-niacinamide": ["niacinamide"],
  "paulas-choice-niacinamide-serum": ["niacinamide"],
  "good-molecules-niacinamide-toner": ["niacinamide"],
  "cerave-niacinamide-body-lotion": ["niacinamide"],
  "lrp-retinol-b3-serum": ["retinol", "alcohol-denat"],
  "paulas-choice-bha-exfoliant": ["salicylic-acid", "alcohol-denat", "fragrance"],
  "cerave-foaming-cleanser": ["sulfates", "fragrance"],
};

/**
 * Pairs that should not share a routine.
 *
 * ⚠️ THE TWO SECTIONS ASK DIFFERENT QUESTIONS OF THIS LIST. CHECK asks "are
 * both of these in the basket the user is about to buy?" and turns a hit into
 * advice rather than a score — see `conflictsFor` in `check.ts`. The analysis
 * asks the narrower question "were both of these in the routine DURING the
 * reaction window?", which is the brief's hypothesis type B, and it must state
 * the result as a possibility rather than a mechanism: "may have increased
 * irritation when used in the same period", never "these clashed".
 */
export const CONFLICTS: [ActiveId, ActiveId][] = [
  ["retinol", "niacinamide"],
  ["retinol", "salicylic-acid"],
];

/** Whether these two actives are a pair that should not share a routine. */
export function conflicts(a: ActiveId, b: ActiveId): boolean {
  return CONFLICTS.some(([x, y]) => (x === a && y === b) || (y === a && x === b));
}

/**
 * The INCI words that mean an active, for a product `PRODUCT_ACTIVES` does not
 * name — which is every LIVE Open Beauty Facts result.
 *
 * ⚠️ WITHOUT THIS, LIVE PRODUCTS MATCH NOTHING AT ALL. `PRODUCT_ACTIVES` is
 * keyed by catalogue id, so a barcode id matched nothing and every searched-for
 * product came back with no actives — a compatibility checker that approves
 * everything the user actually looks up, and an analysis with nothing to
 * subtract. OBF ships the real INCI list, so the actives can be READ off the
 * product rather than looked up beside it.
 *
 * Matching is on the INCI name, not the display name: an ingredient list says
 * PARFUM, not "Fragrance (Parfum)".
 *
 * ⚠️ THE DRYING-ALCOHOL PATTERN NAMES ITS FORMS AND NEVER MATCHES BARE
 * "ALCOHOL". CETEARYL, CETYL and STEARYL ALCOHOL are fatty alcohols — emollients,
 * the OPPOSITE of a drying solvent — and they appear in almost every moisturiser
 * on the shelf, CeraVe Moisturizing Cream included. A bare `\balcohol\b` would
 * therefore flag the gentlest products in the list. Better to miss an unusual
 * spelling than to call a barrier cream drying.
 */
const INCI_PATTERNS: [ActiveId, RegExp][] = [
  ["retinol", /\bretinol\b|\bretinyl\b|\bretinal(?:dehyde)?\b/i],
  ["salicylic-acid", /\bsalicylic acid\b|\bbetaine salicylate\b/i],
  ["niacinamide", /\bniacinamide\b/i],
  ["alcohol-denat", /\balcohol denat\b|\bsd alcohol\b|\bdenatured alcohol\b|\bethanol\b/i],
  ["fragrance", /\bparfum\b|\bfragrance\b|\blinalool\b|\blimonene\b/i],
  ["sulfates", /\bsodium lauryl sulfate\b|\bsodium laureth sulfate\b|\bsls\b/i],
];

function activesFromInci(inci: string): ActiveId[] {
  return INCI_PATTERNS.filter(([, re]) => re.test(inci)).map(([id]) => id);
}

export function activesOf(product: CatalogProduct): ActiveId[] {
  const known = PRODUCT_ACTIVES[product.id];
  if (known) return known;
  /* `ingredients`, NOT `description` — the latter is cut to 240 for the confirm
     card, and an INCI list is ordered by concentration, so the cut takes the
     fragrance and the preservatives with it. */
  return product.ingredients ? activesFromInci(product.ingredients) : [];
}

/**
 * Whether this product's ingredients are known well enough to reason FROM.
 *
 * ⚠️ THE ANALYSIS NEEDS THIS AND CHECK DOES NOT, WHICH IS WHY IT LIVES HERE
 * RATHER THAN BESIDE `activesOf`'s CALLERS. A product with no ingredient list
 * yields an empty active set, and an empty set is indistinguishable from "we
 * looked and it contains nothing of interest". For a SCORE that is harmless —
 * silence is not a penalty. For a SUBTRACTION it is the whole game: a tolerated
 * product with no ingredient list cannot clear a candidate, and counting it as
 * though it could is how an analysis invents evidence it does not have.
 */
export function hasReadableIngredients(product: CatalogProduct): boolean {
  return Boolean(PRODUCT_ACTIVES[product.id] ?? product.ingredients);
}
