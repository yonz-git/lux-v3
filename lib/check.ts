/**
 * CHECK — the product compatibility check.
 *
 * Figma: `HANDOFF — CHECK` (613:2434) on page `06. Screen Designs`, mobile row
 * y=8800. 8 screens x 2 breakpoints.
 *
 * ⚠️ CHECK IS NOT AN INVESTIGATION STEP. No progress track and no `Save & exit`
 * anywhere in it — that pair is the signature of the investigation flow. CHECK
 * is a standalone compatibility check off the Check tab, and it keeps its own
 * state here rather than in `lib/flow.ts`.
 *
 * ⚠️ THE SCORING IS A MODEL, NOT A LOOKUP, AND IT IS DELIBERATELY SIMPLE. There
 * is no ingredient API behind this prototype, so something has to produce the
 * numbers the design shows. The alternative — hardcoding the comp's five scores
 * — would mean any product the user actually picks scores nothing, which is the
 * one thing a compatibility checker must not do.
 *
 * So: every catalogue product declares the actives it contains, each active
 * carries a penalty against THIS user's skin, and the score is what is left of
 * 98. Nothing is 100 — no formula is perfect for anyone.
 *
 * The weights are tuned so the five products on `Check results` (476:2841) come
 * out at exactly the scores the comp draws — 94 / 98 / 62 / 45 / 71 — which is
 * also what pins the band boundaries the handoff derived. That is a check on the
 * model, not a coincidence to preserve at all costs: change a weight and the
 * demo check moves with it, which is correct.
 */
import type { CatalogProduct } from "./products";
import { fullName, productById } from "./products";
import type { IsoDate } from "./date";

/* ---------------------------------------------------------------------------
   Bands — RESOLVED in the handoff, derived from the only evidence in the file.

   >= 80  Compatible  score in feedback/success, and NO pill: the absence of a
                      pill IS the signal
   50-79  Risky       score and pill in feedback/warning
   <= 49  Avoid       score and pill in feedback/error

   ⚠️ THE PILL TEXT IS THE CARRIER, NOT THE COLOUR. feedback/warning and
   feedback/error share a hue and differ only in lightness, so "Risky" and
   "Avoid" are not distinguishable by colour alone. Every row therefore states
   its band in text — visibly on the two that carry a pill, and in an
   aria-label on every row including the compatible ones.
   -------------------------------------------------------------------------- */

export type CompatBand = "compatible" | "risky" | "avoid";

export const BAND_LABEL: Record<CompatBand, string> = {
  compatible: "Compatible",
  risky: "Risky",
  avoid: "Avoid",
};

export function bandFor(score: number): CompatBand {
  if (score >= 80) return "compatible";
  if (score >= 50) return "risky";
  return "avoid";
}

/** The worst band in a set — what a history row shows. */
export function worstBand(results: CheckAnalysis[]): CompatBand {
  if (results.some((r) => r.band === "avoid")) return "avoid";
  if (results.some((r) => r.band === "risky")) return "risky";
  return "compatible";
}

/* ---------------------------------------------------------------------------
   The basket
   -------------------------------------------------------------------------- */

/** Two products is the least you can compare; the handoff caps the check at 8. */
export const MIN_CHECK_PRODUCTS = 2;
export const MAX_CHECK_PRODUCTS = 8;

/* ---------------------------------------------------------------------------
   Actives — what the checker knows how to reason about
   -------------------------------------------------------------------------- */

type ActiveId =
  | "retinol"
  | "salicylic-acid"
  | "niacinamide"
  | "alcohol-denat"
  | "fragrance"
  | "sulfates";

type Active = {
  /** the short form, for an ingredient tag on a results card */
  label: string;
  /** the full form, for an `Ingredients of concern` entry */
  name: string;
  /** points off, for a sensitive + acne-prone profile */
  penalty: number;
  /** the line this active contributes to a product's recommendation */
  advice: string;
  /** why it is a concern, for the ingredient-major view */
  concern: string;
};

const ACTIVES: Record<ActiveId, Active> = {
  "salicylic-acid": {
    label: "Salicylic Acid 2%",
    name: "Salicylic Acid (BHA)",
    penalty: 20,
    advice:
      "Exfoliating acid — use two or three times a week at most, never on broken or irritated skin.",
    concern:
      "An exfoliating acid. Over-use thins the barrier and shows up as stinging and flaking on sensitive skin.",
  },
  retinol: {
    label: "Retinol",
    name: "Retinol",
    penalty: 18,
    advice:
      "Use only at night. Start with 2x per week and increase gradually. May cause dryness and peeling on sensitive skin.",
    concern:
      "A potent active. Redness, dryness and peeling in the first weeks are common, and more pronounced on sensitive skin.",
  },
  "alcohol-denat": {
    label: "Alcohol Denat.",
    name: "Alcohol Denat.",
    penalty: 18,
    advice: "Drying on sensitive skin — follow with a barrier moisturiser.",
    concern:
      "A drying solvent, high in the ingredient list of many serums. Commonly associated with tightness and redness.",
  },
  fragrance: {
    label: "Fragrance",
    name: "Fragrance (Parfum)",
    penalty: 15,
    advice: "A common trigger for sensitive skin. Patch test before daily use.",
    concern:
      "One of the most common causes of contact dermatitis. Reaction timing often aligns with product introduction.",
  },
  sulfates: {
    label: "SLS",
    name: "Sodium Lauryl Sulfate (SLS)",
    penalty: 12,
    advice: "Can strip the barrier. Avoid using twice a day.",
    concern:
      "Known irritant for sensitive skin. Commonly associated with redness and dryness.",
  },
  niacinamide: {
    label: "Niacinamide",
    name: "Niacinamide",
    penalty: 4,
    advice: "Well tolerated. No special handling needed.",
    concern: "",
  },
};

/**
 * What each catalogue product contains. Only what the checker reasons about —
 * this is not an INCI list.
 *
 * A product missing from this map contains nothing the checker objects to and
 * scores the full 98, which is the right default: silence should not be a
 * penalty.
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

/** Nothing scores 100 — no formula is perfect for anyone. */
const BASE_SCORE = 98;

/**
 * Pairs that should not share a routine.
 *
 * ⚠️ A CONFLICT DOES NOT MOVE THE SCORE, IT CHANGES THE ADVICE — and that is
 * what the comp does. `Check results` scores The Ordinary Niacinamide at 94
 * with a retinol in the same check, while the retinol's own recommendation
 * reads "Do not combine with Niacinamide in the same routine". The score
 * answers "is this product right for my skin?", which is a fact about the
 * product; the recommendation answers "how do I use it alongside the rest?",
 * which is the only place a pair belongs. Penalising both halves would also
 * double-count one problem.
 */
const CONFLICTS: [ActiveId, ActiveId][] = [
  ["retinol", "niacinamide"],
  ["retinol", "salicylic-acid"],
];

function activesOf(product: CatalogProduct): ActiveId[] {
  return PRODUCT_ACTIVES[product.id] ?? [];
}

/**
 * The ingredient words a product should be findable by on `/check/new`.
 *
 * ⚠️ THIS LIVES HERE, NOT IN `lib/products.ts`. The actives model is this
 * module's, and `products.ts` cannot import it without a cycle — so the search
 * takes them as a parameter instead. It is also the honest split: searching by
 * what a product CONTAINS is a compatibility question, which is why the check
 * builder passes this and the PRODUCTS add tray does not.
 *
 * Both the label and the id are returned, so "salicylic acid", "BHA" and
 * "salicylic-acid" all find the same product.
 */
export function checkSearchTerms(product: CatalogProduct): string[] {
  return activesOf(product).flatMap((id) => [ACTIVES[id].name, id]);
}

/** The actives of `product` whose name matches `query` — the reason a row that
 *  does not mention the ingredient anywhere on its face came back for it. */
export function matchedActives(
  product: CatalogProduct,
  query: string
): string[] {
  const terms = query.toLowerCase().split(/[^a-z0-9%]+/i).filter(Boolean);
  if (terms.length === 0) return [];
  return activesOf(product)
    .map((id) => ACTIVES[id].name)
    .filter((name) => {
      const hay = name.toLowerCase();
      return terms.some((t) => hay.includes(t));
    });
}

/** Which of `product`'s actives clash with something else in the basket. */
function conflictsFor(
  product: CatalogProduct,
  basket: CatalogProduct[]
): { other: CatalogProduct; mine: ActiveId; theirs: ActiveId }[] {
  const mine = activesOf(product);
  const found: { other: CatalogProduct; mine: ActiveId; theirs: ActiveId }[] = [];

  for (const other of basket) {
    if (other.id === product.id) continue;
    for (const theirs of activesOf(other)) {
      for (const a of mine) {
        const clash = CONFLICTS.some(
          ([x, y]) => (x === a && y === theirs) || (y === a && x === theirs)
        );
        /* Attributed to the HARSHER half only, so one problem is reported
           once — on the product the user has to be careful with. */
        if (clash && ACTIVES[a].penalty > ACTIVES[theirs].penalty) {
          found.push({ other, mine: a, theirs });
        }
      }
    }
  }
  return found;
}

/* ---------------------------------------------------------------------------
   The result
   -------------------------------------------------------------------------- */

export type CheckAnalysis = {
  product: CatalogProduct;
  score: number;
  band: CompatBand;
  /** the ingredient tags — every active that cost this product points */
  riskyIngredients: string[];
  recommendation: string;
};

export function analyse(
  product: CatalogProduct,
  basket: CatalogProduct[]
): CheckAnalysis {
  const actives = activesOf(product);
  const score = Math.max(
    0,
    actives.reduce((n, a) => n - ACTIVES[a].penalty, BASE_SCORE)
  );

  /* The mild ones are not "risky" — niacinamide costs 4 points and belongs in
     the score, not in a warning tag. 10 is the line between "worth naming" and
     "worth knowing". */
  const risky = actives.filter((a) => ACTIVES[a].penalty >= 10);

  const conflicts = conflictsFor(product, basket);
  const lines = [
    ...conflicts.map(
      (c) =>
        `Do not combine with ${fullName(c.other)} in the same routine — alternate days.`
    ),
    ...actives.map((a) => ACTIVES[a].advice),
  ];

  return {
    product,
    score,
    band: bandFor(score),
    riskyIngredients: risky.map((a) => ACTIVES[a].label),
    recommendation: lines.join(" "),
  };
}

/** Every product in the basket, worst first — the order the comp lists them in
 *  is not alphabetical, and a readout should lead with what needs attention. */
export function analyseCheck(basket: CatalogProduct[]): CheckAnalysis[] {
  return basket.map((p) => analyse(p, basket)).sort((a, b) => a.score - b.score);
}

/** How many ingredients the analysing screen claims to be reading. */
export function ingredientCount(basket: CatalogProduct[]): number {
  /* A stated number has to come from somewhere. This is the actives the
     checker knows about plus a fixed base per product, so it grows with the
     basket and is the same every time for the same basket. */
  return basket.reduce((n, p) => n + 14 + activesOf(p).length * 2, 0);
}

/* ---------------------------------------------------------------------------
   History
   -------------------------------------------------------------------------- */

export type SavedCheck = {
  id: string;
  /** ISO date the check was run */
  date: IsoDate;
  productIds: string[];
};

/** "18 August 2026" — the format on a history row. */
export function formatCheckDate(iso: IsoDate): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function productsOf(check: SavedCheck): CatalogProduct[] {
  return check.productIds
    .map(productById)
    .filter((p): p is CatalogProduct => Boolean(p));
}

/* ---------------------------------------------------------------------------
   The demo check

   ⚠️ SAME CALL AS `/progress` — see lib/progress.ts. The Check tab is a
   readout section too, and `Check — previous checks` with nothing in it
   demonstrates nothing. The history is seeded so the section is walkable from a
   cold start; running a real check prepends to it and the seed stays below.

   The five products and the date are the comp's own (`Check results` 476:2841,
   `Check — previous checks` 652:2554). The scores are NOT stored — they come
   back out of `analyse()`, so the seeded check and a user's check are read the
   same way and neither can drift from the model.
   -------------------------------------------------------------------------- */

export const DEMO_CHECKS: SavedCheck[] = [
  {
    id: "demo-1",
    date: "2026-08-18",
    productIds: [
      "the-ordinary-niacinamide",
      "lrp-retinol-b3-serum",
      "paulas-choice-bha-exfoliant",
      "cerave-moisturizing-cream-16",
      "cerave-foaming-cleanser",
    ],
  },
  {
    id: "demo-2",
    date: "2026-08-11",
    productIds: ["lrp-retinol-b3-serum", "the-ordinary-niacinamide"],
  },
  {
    id: "demo-3",
    date: "2026-08-02",
    productIds: ["cerave-moisturizing-cream-16", "cerave-am-lotion-spf30"],
  },
];

/* ---------------------------------------------------------------------------
   THE INGREDIENT-MAJOR VIEW — `Ingredients of concern` on `06 — Results`
   (549:1139), and the synthesis blocks that now open `Check results` too.

   ⚠️ THIS IS THE SAME MODEL READ THE OTHER WAY UP, NOT A SECOND ONE. A results
   card is product-major: "here is your product, here is what it costs you". An
   `Ingredients of concern` entry is ingredient-major: "here is the ingredient,
   here is which of your products it is in". `06 — Results` is the investigation
   asking WHAT IS CAUSING THIS, so it leads with the cause; `Check results` was
   asking DO THESE WORK TOGETHER, so it led with the products — and had no
   answer at all to "so what do I do?". Inverting the index costs nothing and
   gives both screens the half they were missing.
   -------------------------------------------------------------------------- */

export type Likelihood = "high" | "moderate";

export const LIKELIHOOD_LABEL: Record<Likelihood, string> = {
  high: "High likelihood",
  moderate: "Moderate likelihood",
};

export type IngredientConcern = {
  id: string;
  name: string;
  /** the products in this set that contain it */
  foundIn: CatalogProduct[];
  description: string;
  likelihood: Likelihood;
};

/**
 * The actives worth naming, worst first, each with the products it was found in.
 *
 * ⚠️ THE MILD ONES ARE LEFT OUT. Niacinamide costs 4 points and belongs in a
 * score, not in a list headed "of concern" — the same 10-point line
 * `analyse()` uses for its ingredient tags, so a product's tags and this list
 * can never disagree about what counts.
 */
export function ingredientsOfConcern(
  basket: CatalogProduct[]
): IngredientConcern[] {
  const byActive = new Map<ActiveId, CatalogProduct[]>();

  for (const product of basket) {
    for (const a of activesOf(product)) {
      if (ACTIVES[a].penalty < 10) continue;
      byActive.set(a, [...(byActive.get(a) ?? []), product]);
    }
  }

  return [...byActive.entries()]
    .sort(([a], [b]) => ACTIVES[b].penalty - ACTIVES[a].penalty)
    .map(([id, foundIn]) => ({
      id,
      name: ACTIVES[id].name,
      foundIn,
      description: ACTIVES[id].concern,
      /* The same boundary the harsh/irritant split already implies: an active
         that costs 18+ is the kind that shows up on its own, one that costs
         less needs the timing to agree. */
      likelihood: ACTIVES[id].penalty >= 18 ? "high" : "moderate",
    }));
}

/** The three figures on `card · investigation summary` (548:1165). */
export function checkSummary(basket: CatalogProduct[]): {
  products: number;
  ingredients: number;
  flagged: number;
} {
  return {
    products: basket.length,
    ingredients: ingredientCount(basket),
    flagged: ingredientsOfConcern(basket).length,
  };
}

/**
 * The single product to act on, and why — what `card · what to do next`
 * (549:1163) leads with.
 *
 * The worst-scoring product, and the worst active in it. Null when nothing in
 * the set is worth acting on, which is a real outcome and has to render as one
 * rather than as an empty card.
 */
export function primaryConcern(
  basket: CatalogProduct[]
): { product: CatalogProduct; ingredient: IngredientConcern } | null {
  const worst = analyseCheck(basket)[0];
  if (!worst || worst.band === "compatible") return null;

  const ingredient = ingredientsOfConcern(basket).find((c) =>
    c.foundIn.some((p) => p.id === worst.product.id)
  );
  if (!ingredient) return null;

  return { product: worst.product, ingredient };
}

/**
 * The routine advice for a CHECK — every pair in the set that should not share
 * a routine, said once.
 *
 * ⚠️ THE PAIRS ARE THE WHOLE POINT OF A COMPATIBILITY CHECK, and they were only
 * reachable by opening an accordion. Surfacing them at the top is the "what do
 * I do?" the screen never answered.
 */
export function routineAdvice(basket: CatalogProduct[]): string[] {
  const seen = new Set<string>();
  const lines: string[] = [];

  for (const product of basket) {
    for (const c of conflictsFor(product, basket)) {
      const key = [product.id, c.other.id].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(
        `Do not use ${fullName(product)} and ${fullName(c.other)} in the same routine — alternate days.`
      );
    }
  }
  return lines;
}

/* ---------------------------------------------------------------------------
   The elimination schedule — `check-in-schedule` on 549:1175.

   Week 1, 2 and 4 from the day the results were produced. The comp's Aug 18 /
   Aug 25 / Sep 8 are exactly +7 / +14 / +28 from an 11 Aug reading, so the
   offsets are the design's, not invented.
   -------------------------------------------------------------------------- */

export const ELIMINATION_WEEKS = 4;

export type ScheduleNode = { week: number; date: Date; note?: string };

export function eliminationSchedule(from: Date): ScheduleNode[] {
  const at = (days: number) =>
    new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);

  return [
    { week: 1, date: at(7), note: "First check-in: note any changes" },
    { week: 2, date: at(14) },
    { week: ELIMINATION_WEEKS, date: at(28), note: "Final assessment" },
  ];
}

/** "Aug 18, 2026" — the schedule's date format. */
export function formatScheduleDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
