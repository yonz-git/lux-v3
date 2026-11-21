/**
 * The ingredient vocabulary — what the app knows how to reason about, and the
 * only place that knowledge lives.
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
  /** Why it is a concern. */
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

/** Pairs that should not share a routine. */
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

/** Whether this product's ingredients are known well enough to reason FROM. */
export function hasReadableIngredients(product: CatalogProduct): boolean {
  return Boolean(PRODUCT_ACTIVES[product.id] ?? product.ingredients);
}
