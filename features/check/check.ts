/**
 * CHECK — the product compatibility check.
 *
 * Figma: `HANDOFF — CHECK` (613:2434) on page `06. Screen Designs`, mobile row
 * y=8800. 8 screens x 2 breakpoints.
 */
import type { CatalogProduct } from "@/features/products/products";
import { fullName, productById } from "@/features/products/products";
import type { IsoDate } from "@/lib/date";
import type { ActiveId } from "@/lib/actives";
import { ACTIVES, activesOf, conflicts } from "@/lib/actives";

/* Bands — RESOLVED in the handoff, derived from the only evidence in the file.

   >= 80  Compatible  score in feedback/success, and NO pill: the absence of a
   pill IS the signal
   50-79  Risky       score and pill in feedback/warning
   <= 49  Avoid       score and pill in feedback/error */

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

/* Scoring — CHECK's half of the ingredient model */

type Scoring = {
  /** points off, for a sensitive + acne-prone profile */
  penalty: number;
  /** the line this active contributes to a product's recommendation */
  advice: string;
};

const SCORING: Record<ActiveId, Scoring> = {
  "salicylic-acid": {
    penalty: 20,
    advice:
      "Exfoliating acid, use two or three times a week at most, never on broken or irritated skin.",
  },
  retinol: {
    penalty: 18,
    advice:
      "Use only at night. Start with 2x per week and increase gradually. May cause dryness and peeling on sensitive skin.",
  },
  "alcohol-denat": {
    penalty: 18,
    advice: "Drying on sensitive skin, follow with a barrier moisturiser.",
  },
  fragrance: {
    penalty: 15,
    advice: "A common trigger for sensitive skin. Patch test before daily use.",
  },
  sulfates: {
    penalty: 12,
    advice: "Can strip the barrier. Avoid using twice a day.",
  },
  niacinamide: {
    penalty: 4,
    advice: "Well tolerated. No special handling needed.",
  },
};

/** Nothing scores 100 — no formula is perfect for anyone. */
const BASE_SCORE = 98;

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
        /* Attributed to the HARSHER half only, so one problem is reported
           once — on the product the user has to be careful with. */
        if (conflicts(a, theirs) && SCORING[a].penalty > SCORING[theirs].penalty) {
          found.push({ other, mine: a, theirs });
        }
      }
    }
  }
  return found;
}

/** The ingredient words a product should be findable by on `/check/new`. */
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
    actives.reduce((n, a) => n - SCORING[a].penalty, BASE_SCORE)
  );

  /* The mild ones are not "risky" — niacinamide costs 4 points and belongs in
     the score, not in a warning tag. 10 is the line between "worth naming" and
     "worth knowing". */
  const risky = actives.filter((a) => SCORING[a].penalty >= 10);

  const conflicts = conflictsFor(product, basket);
  const lines = [
    ...conflicts.map(
      (c) =>
        `Do not combine with ${fullName(c.other)} in the same routine, alternate days.`
    ),
    ...actives.map((a) => SCORING[a].advice),
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
   What the analysing screen says it is doing
   -------------------------------------------------------------------------- */

/** The passes `/check/analyzing` names while it waits. */
export const CHECK_PASSES = [
  "Reading the ingredients in each product",
  "Scoring each one against your skin profile",
  "Flagging ingredients that commonly irritate",
  "Checking for pairs that clash in one routine",
  "Working out what to change in your routine",
] as const;

/* ---------------------------------------------------------------------------
   History
   -------------------------------------------------------------------------- */

export type SavedCheck = {
  id: string;
  /** ISO date the check was run */
  date: IsoDate;
  products: CatalogProduct[];
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
  return check.products;
}

/** The seeded checks are authored by catalogue id, because that is what is
 *  readable in a fixture; they are resolved to products once, here. */
function demoCheck(id: string, date: IsoDate, ids: string[]): SavedCheck {
  return {
    id,
    date,
    products: ids.map(productById).filter((p): p is CatalogProduct => Boolean(p)),
  };
}

/* The demo check */

export const DEMO_CHECKS: SavedCheck[] = [
  demoCheck("demo-1", "2026-08-18", [
    "the-ordinary-niacinamide",
    "lrp-retinol-b3-serum",
    "paulas-choice-bha-exfoliant",
    "cerave-moisturizing-cream-16",
    "cerave-foaming-cleanser",
  ]),
  demoCheck("demo-2", "2026-08-11", [
    "lrp-retinol-b3-serum",
    "the-ordinary-niacinamide",
  ]),
  demoCheck("demo-3", "2026-08-02", [
    "cerave-moisturizing-cream-16",
    "cerave-am-lotion-spf30",
  ]),
];

/* THE INGREDIENT-MAJOR VIEW — `Ingredients of concern` on `06 — Results`
   (549:1139), and the synthesis blocks that now open `Check results` too. */

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

/** The actives worth naming, worst first, each with the products it was found in. */
export function ingredientsOfConcern(
  basket: CatalogProduct[]
): IngredientConcern[] {
  const byActive = new Map<ActiveId, CatalogProduct[]>();

  for (const product of basket) {
    for (const a of activesOf(product)) {
      if (SCORING[a].penalty < 10) continue;
      byActive.set(a, [...(byActive.get(a) ?? []), product]);
    }
  }

  return [...byActive.entries()]
    .sort(([a], [b]) => SCORING[b].penalty - SCORING[a].penalty)
    .map(([id, foundIn]) => ({
      id,
      name: ACTIVES[id].name,
      foundIn,
      description: ACTIVES[id].concern,
      /* The same boundary the harsh/irritant split already implies: an active
         that costs 18+ is the kind that shows up on its own, one that costs
         less needs the timing to agree. */
      likelihood: SCORING[id].penalty >= 18 ? "high" : "moderate",
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
 * a routine, said once, plus the one rule that always applies.
 */
export type NextStep = {
  /** stable across renders — the two product ids, sorted */
  id: string;
  title: string;
  body: string;
  /** the products the step is about, in the order the title names them */
  products: CatalogProduct[];
};

export function routineAdvice(basket: CatalogProduct[]): NextStep[] {
  const seen = new Set<string>();
  const steps: NextStep[] = [];
  /* the emphasis block pauses the worst product only when it is in the Avoid
     band — `analyseCheck` is sorted worst-first, so [0] is that product */
  const worst = analyseCheck(basket)[0];
  const pausedId = worst?.band === "avoid" ? worst.product.id : null;

  for (const product of basket) {
    for (const c of conflictsFor(product, basket)) {
      const key = [product.id, c.other.id].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);

      const involvesPaused =
        pausedId === product.id || pausedId === c.other.id;

      steps.push({
        id: key,
        title: `Keep ${product.name} and ${c.other.name} on alternate nights`,
        body: involvesPaused
          ? `${ACTIVES[c.mine].label} and ${ACTIVES[c.theirs].label} irritate in the same routine, so this pair settles itself while ${worst.product.name} is out, and matters again the day it comes back.`
          : `${ACTIVES[c.mine].label} and ${ACTIVES[c.theirs].label} irritate in the same routine. One tonight, the other tomorrow.`,
        products: [product, c.other],
      });
    }
  }

  steps.push({
    id: "one-at-a-time",
    title: "Bring anything back one product at a time",
    body: "Two at once and a reaction cannot be traced to either of them.",
    products: [],
  });

  return steps;
}

/* The elimination schedule — `check-in-schedule` on 549:1175.

   Week 1, 2 and 4 from the day the results were produced. */

export const ELIMINATION_WEEKS = 4;

export type ScheduleNode = { week: number; date: Date; note?: string };

/** "Aug 18, 2026" — the schedule's date format. */
export function formatScheduleDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
