/**
 * THE ANALYSIS — the retrospective one, the thing LUX is named for.
 *
 * Source: `docs/product-brief.md` §§ 05–12, "Analysis model to communicate
 * through the UI". Nothing in Figma covers it — page `06. Screen Designs` has
 * no analysis frames outside CHECK — so every screen built on this module
 * carries a `⚠️ NOT IN FIGMA` comment and a line in `docs/figma-catchup.md`.
 *
 * ⚠️ THIS IS NOT `features/check/check.ts` AND THE TWO MUST NOT CONVERGE. CHECK
 * asks "is this product right for my skin?" — prospective, one product at a
 * time, scored. This asks "which of the things I already use is associated with
 * the reaction I recorded?" — retrospective, over a timeline, and the answer is
 * an argument rather than a number. They share `lib/actives.ts` and nothing
 * else. In particular this file cannot see `SCORING`, which is deliberate:
 * those weights are tuned to reproduce a comp's five scores and have no
 * business behind a sentence about what caused someone's reaction.
 *
 * ⚠️ AND IT IS NOT A SIXTH INVESTIGATION STEP. The five steps COLLECT; this
 * REPORTS on what they collected, so it lives off `/investigation` as a pushed
 * result view — the standing `/check/results` has to `/check/new`. `flow.ts` is
 * untouched and `TOTAL_STEPS` is still 5.
 *
 * ---------------------------------------------------------------------------
 * THE SHAPE OF THE ARGUMENT
 *
 *   1. Every product gets an EVIDENCE STATE from the timeline — associated with
 *      the reaction, used without problems, or not enough history. Derived, and
 *      confirmed by the user only where the derivation is genuinely ambiguous.
 *   2. GATES decide whether an answer is possible at all. They are structural,
 *      not a product count: see `MIN_CHECK_PRODUCTS` below.
 *   3. The SUBTRACTION runs once and produces both halves of the case — the
 *      candidates the tolerated set fails to clear are the evidence FOR, the
 *      ones it clears are the evidence AGAINST. Same pass.
 *   4. The PAIR pass asks the narrower same-routine question of `CONFLICTS`.
 *   5. The OUTCOME is one of the brief's three, and one of them is a refusal.
 *
 * ⚠️ NO NUMBER EVER LEAVES THIS FILE AS A CONFIDENCE. The brief: "Do not show a
 * scientific-looking percentage." A percentage dresses a judgement up as a
 * measurement, and this judgement is made from four coarse duration buckets and
 * an ingredient list of unknown concentration. `Confidence` is a word, and it is
 * derived from the SHAPE of the subtraction — how much of the associated set
 * carries the candidate, and how much tolerated evidence was available to clear
 * it with. Counts of products are facts and may be shown; a score may not.
 */
import type { Answers } from "@/lib/store/answers";
import type { SavedProduct } from "@/features/products/products";
import { fullName } from "@/features/products/products";
import type { ActiveId } from "@/lib/actives";
import {
  ACTIVES,
  CONFLICTS,
  activesOf,
  hasReadableIngredients,
} from "@/lib/actives";
import { daysBetween, fromIso } from "@/lib/date";

/* ---------------------------------------------------------------------------
   The timeline

   The only temporal data the app has is FOUR COARSE BUCKETS — "4+ weeks",
   "1–4 weeks", "Less than 1 week", "Not sure" — measured from today, plus one
   absolute flare date from step 4. Everything below is arithmetic on that, and
   the imprecision is the reason the third evidence state exists at all.
   -------------------------------------------------------------------------- */

/**
 * How many days ago a product was introduced, as a RANGE, because the duration
 * answer is a bucket rather than a date. `max: null` means open-ended.
 */
type IntroWindow = { min: number; max: number | null };

const INTRO_WINDOW: Record<SavedProduct["bucket"], IntroWindow | null> = {
  "long-term": { min: 28, max: null },
  recent: { min: 7, max: 28 },
  "new-addition": { min: 0, max: 7 },
  /* ⚠️ `Not sure` HAS NO WINDOW AND IS NOT BINNED INTO ONE. That is the whole
     reason it is kept out of `BUCKETS` as its own group rather than filed under
     Long term — see `UNSORTED_BUCKET` in `products.ts`. A product with no
     timeline cannot be placed against the flare date, and pretending otherwise
     is how an analysis invents evidence. */
  "not-sure": null,
};

/**
 * How long before the reaction started a product could have been introduced and
 * still be a plausible suspect.
 *
 * ⚠️ 14 DAYS IS A JUDGEMENT, NOT A MEASUREMENT, AND THE UI MUST NOT IMPLY
 * OTHERWISE. Irritant and allergic reactions can surface anywhere from hours to
 * weeks after a product enters a routine; two weeks is a commonly used
 * observation window and is the same length as half the four-week elimination
 * period `ELIMINATION_WEEKS` already uses. It is here as one named constant
 * precisely so it can be argued with, rather than being spread across three
 * comparisons nobody can find.
 */
export const LEAD_IN_DAYS = 14;

/**
 * Where a product sits relative to the reaction. The brief's three states,
 * verbatim from its controlled vocabulary — see `docs/product-brief.md`
 * § "UX vocabulary". Do not rename these to anything stronger.
 */
export type EvidenceState = "associated" | "tolerated" | "unclear";

export const EVIDENCE_LABEL: Record<EvidenceState, string> = {
  associated: "Associated with this reaction",
  tolerated: "Used without problems",
  unclear: "Not enough history",
};

/**
 * The evidence state the timeline implies, before the user confirms anything.
 *
 * The suspicion window runs from `LEAD_IN_DAYS` before the flare up to today.
 * A product's introduction is a range, so there are three cases and not two:
 * the range sits ENTIRELY inside the window (associated), ENTIRELY before it
 * (tolerated), or STRADDLES the boundary — which is not a tie to break, it is
 * the honest answer, and it is what § 05's confirmation list exists to resolve.
 */
export function deriveEvidence(
  product: SavedProduct,
  daysSinceFlare: number
): EvidenceState {
  const w = INTRO_WINDOW[product.bucket];
  if (!w) return "unclear";

  const boundary = daysSinceFlare + LEAD_IN_DAYS;
  if (w.max !== null && w.max <= boundary) return "associated";
  if (w.min > boundary) return "tolerated";
  return "unclear";
}

/**
 * A product with its evidence state resolved — derived, then overridden by the
 * user's own answer where they gave one.
 */
export type ProductEvidence = {
  product: SavedProduct;
  state: EvidenceState;
  /** true when the user answered the confirmation rather than the timeline */
  confirmed: boolean;
  /** whether there is an ingredient list to reason from */
  readable: boolean;
  actives: ActiveId[];
};

export function evidenceFor(a: Answers): ProductEvidence[] {
  const flare = a.timing?.date ? fromIso(a.timing.date) : null;
  if (!flare) return [];
  const daysSinceFlare = Math.max(0, daysBetween(flare, new Date()));

  return (a.products ?? []).map((product) => {
    const confirmedState = a.evidence?.[product.id];
    return {
      product,
      state: confirmedState ?? deriveEvidence(product, daysSinceFlare),
      confirmed: Boolean(confirmedState),
      readable: hasReadableIngredients(product),
      actives: activesOf(product),
    };
  });
}

/* ---------------------------------------------------------------------------
   § 05 — the gates

   ⚠️ THESE ARE STRUCTURAL, AND `MIN_CHECK_PRODUCTS = 2` IS NOT THE MODEL. Two
   products is the right floor for a COMPATIBILITY check — two is exactly when a
   pair interaction becomes possible — and far too low for a CAUSAL one. But a
   flat count is the wrong shape either way: five products all added last week,
   with no tolerated history between them, gives a subtraction nothing to
   subtract, while three products can answer cleanly if one of them entered the
   routine in the window and two did not.

   So each gate names a STRUCTURE the argument needs, and the step that can fix
   it. From `docs/decisions.md`: "refusing to answer is the hardest thing to
   design and the easiest thing to admire."
   -------------------------------------------------------------------------- */

export type GapId =
  | "no-flare-date"
  | "nothing-new"
  | "no-tolerated-history"
  | "routine-incomplete"
  | "ingredients-missing";

export type Gap = {
  id: GapId;
  /** what is missing, in the user's words */
  title: string;
  /** why the analysis cannot proceed without it */
  body: string;
  /** where the user goes to fix it */
  href: string;
  action: string;
};

/** Tolerated products carrying an ingredient list — what a subtraction needs
 *  on the other side of the minus sign. Two, because one product clearing a
 *  candidate is a coincidence and the brief asks for a pattern. */
const MIN_TOLERATED = 2;

/**
 * The two product types § 05 requires to be present or explicitly declared.
 *
 * ⚠️ MATCHED ON THE NAME, WHICH IS A PROTOTYPE-GRADE HEURISTIC AND SAYS SO.
 * Open Beauty Facts has a category field this should read instead; it is not
 * requested by `openBeautyFacts.ts` today. The failure mode is mild and in the
 * right direction — an unrecognised cleanser asks the user a question they can
 * answer in one tap, rather than silently passing a gate.
 */
export type RoutineRole = "cleanser" | "sunscreen";

const ROUTINE_ROLES: { id: RoutineRole; label: string; re: RegExp }[] = [
  { id: "cleanser", label: "cleanser", re: /cleans|wash|foaming|micellar|makeup remover/i },
  { id: "sunscreen", label: "sunscreen", re: /spf|sunscreen|sun cream|uv\b|fluid uv/i },
];

function hasRole(products: SavedProduct[], re: RegExp): boolean {
  return products.some((p) => re.test(`${p.brand} ${p.name} ${p.description ?? ""}`));
}

/**
 * The roles § 05 still has no answer for — neither a product that looks like
 * one, nor a declaration that the user does not use one.
 *
 * ⚠️ THE DECLARATION IS COLLECTED ON `/investigation/evidence`, NOT ON STEP 5.
 * The brief's own flow diagram puts "Review products and missing
 * cleanser/sunscreen" between the product collection and the analysis, which is
 * this screen — and it is the better place regardless: on step 5 the question
 * would arrive before the user has finished adding, so "no, I don't use one"
 * would be asked of someone who was about to add one.
 */
export function missingRoutineRoles(
  a: Answers
): { id: RoutineRole; label: string; declared: boolean }[] {
  const products = a.products ?? [];
  const declared = a.routineNotUsed ?? [];
  return ROUTINE_ROLES.filter((role) => !hasRole(products, role.re)).map(
    ({ id, label }) => ({ id, label, declared: declared.includes(id) })
  );
}

/**
 * Everything standing between the recorded investigation and an answer.
 *
 * An empty array means the analysis can run. A non-empty one IS the
 * no-conclusion screen's content — § 11 requires the exact reason, not a
 * generic failure.
 */
export function gaps(a: Answers): Gap[] {
  const out: Gap[] = [];

  if (!a.timing?.date) {
    out.push({
      id: "no-flare-date",
      title: "When the reaction started",
      body: "Every product is compared against the day your skin changed. Without that day there is nothing to compare them to.",
      href: "/investigation/timing",
      action: "Add the date",
    });
    /* Nothing below can be computed without it, so stop here rather than
       reporting five consequences of one missing answer. */
    return out;
  }

  const evidence = evidenceFor(a);
  const products = a.products ?? [];

  if (products.length === 0 || !evidence.some((e) => e.state === "associated")) {
    out.push({
      id: "nothing-new",
      title: "A product you were using around the time it started",
      body: "Nothing in your list entered your routine near the reaction. Add anything you used in the four weeks before it — including products you do not suspect.",
      href: "/investigation/products",
      action: "Add products",
    });
  }

  const tolerated = evidence.filter((e) => e.state === "tolerated" && e.readable);
  if (tolerated.length < MIN_TOLERATED) {
    out.push({
      id: "no-tolerated-history",
      title: "Products you have used for a while without problems",
      body: "These are what rule an ingredient OUT. Without at least two, anything shared by your newer products stays a suspect and none of it can be cleared.",
      href: "/investigation/products",
      action: "Add products",
    });
  }

  const missingRoles = missingRoutineRoles(a).filter((r) => !r.declared);
  if (missingRoles.length > 0) {
    out.push({
      id: "routine-incomplete",
      title: `No ${missingRoles.map((r) => r.label).join(" or ")} in your list`,
      body: "These touch the whole face every day, so leaving one out hides the product most likely to be involved. Add it, or say you do not use one.",
      href: "/investigation/evidence",
      action: "Add or declare",
    });
  }

  const readable = evidence.filter((e) => e.readable).length;
  if (products.length > 0 && readable * 2 <= products.length) {
    out.push({
      id: "ingredients-missing",
      title: "Ingredient lists for most of your products",
      body: `${products.length - readable} of ${products.length} have no ingredient list, so there is nothing to compare between them.`,
      href: "/investigation/evidence",
      action: "Review products",
    });
  }

  return out;
}

/* ---------------------------------------------------------------------------
   § 05 — the confirmation list

   "Do not force the user to label every product suspicious or safe. Show a
   compact confirmation list only when the AI's interpretation is ambiguous."
   -------------------------------------------------------------------------- */

/**
 * The products whose timeline straddles the boundary. Exactly these get a
 * question, and no others.
 *
 * ⚠️ ANSWERING ONE DOES NOT REMOVE IT FROM THE LIST — `confirmed` products stay,
 * carrying the user's answer. A card that vanishes the moment it is tapped
 * gives no confirmation that the tap landed and no way to change the answer,
 * and on a screen whose whole job is "check what I worked out", that is the
 * wrong direction to fail in.
 */
export function needsConfirmation(a: Answers): ProductEvidence[] {
  return evidenceFor(a).filter((e) => e.state === "unclear" || e.confirmed);
}

/** How many of those are still unanswered — what the screen counts aloud. */
export function unansweredCount(a: Answers): number {
  return evidenceFor(a).filter((e) => e.state === "unclear" && !e.confirmed)
    .length;
}

/* ---------------------------------------------------------------------------
   The subtraction — hypothesis type A

   "An ingredient appears across products associated with the reaction and is
   absent — or less supported — in products used without problems."
   -------------------------------------------------------------------------- */

export type Confidence = "stronger" | "possible" | "weak";

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  stronger: "Stronger pattern",
  possible: "Possible pattern",
  weak: "Weak pattern",
};

export type IngredientHypothesis = {
  kind: "ingredient";
  id: string;
  active: ActiveId;
  name: string;
  confidence: Confidence;
  /** associated products containing it — the evidence FOR */
  inAssociated: SavedProduct[];
  /** tolerated products containing it — the evidence AGAINST */
  inTolerated: SavedProduct[];
  /** how many associated products there were to appear in */
  associatedTotal: number;
  /** how many tolerated products had a list to be absent from */
  toleratedReadable: number;
};

export type PairHypothesis = {
  kind: "pair";
  id: string;
  actives: [ActiveId, ActiveId];
  confidence: Confidence;
  /** the products carrying each half, in the order `actives` names them */
  products: [SavedProduct, SavedProduct];
  /** true when both halves entered the routine inside the window */
  bothNew: boolean;
};

export type Hypothesis = IngredientHypothesis | PairHypothesis;

/**
 * The confidence word, from the shape of the subtraction and nothing else.
 *
 * ⚠️ IT IS NOT A THRESHOLD ON A SCORE, AND THERE IS NO SCORE. Three things
 * decide it: how much of the associated set carries the candidate, whether any
 * tolerated product carries it too, and — the one people forget — how much
 * tolerated evidence there was to be absent from. A candidate absent from an
 * empty tolerated set has not been cleared of anything, and calling that
 * "stronger" would be the analysis crediting itself for evidence it never had.
 */
function confidenceFor(h: {
  inAssociated: unknown[];
  inTolerated: unknown[];
  associatedTotal: number;
  toleratedReadable: number;
}): Confidence {
  if (h.inTolerated.length > 0) return "weak";
  if (h.inAssociated.length < 2) return "weak";
  if (
    h.inAssociated.length === h.associatedTotal &&
    h.toleratedReadable >= MIN_TOLERATED
  ) {
    return "stronger";
  }
  return "possible";
}

/**
 * Both halves of the case, from one pass.
 *
 * ⚠️ THE CLEARED CANDIDATES ARE NOT WASTE — THEY ARE § 08's "EVIDENCE AGAINST"
 * ACCORDION, which no screen in LUX has a pattern for and which the brief
 * requires on every hypothesis. An ingredient the user's own tolerated history
 * argues against is the most useful thing this analysis produces, and it is
 * free: it is the same subtraction, read from the other side. Returning only
 * the survivors is how a reasoning screen turns into advocacy.
 */
export function subtract(evidence: ProductEvidence[]): {
  candidates: IngredientHypothesis[];
  cleared: IngredientHypothesis[];
} {
  const associated = evidence.filter((e) => e.state === "associated");
  const tolerated = evidence.filter((e) => e.state === "tolerated" && e.readable);

  const byActive = new Map<ActiveId, SavedProduct[]>();
  for (const e of associated) {
    for (const id of e.actives) {
      byActive.set(id, [...(byActive.get(id) ?? []), e.product]);
    }
  }

  const all: IngredientHypothesis[] = [...byActive.entries()]
    .map(([active, inAssociated]) => {
      const inTolerated = tolerated
        .filter((t) => t.actives.includes(active))
        .map((t) => t.product);
      const h = {
        inAssociated,
        inTolerated,
        associatedTotal: associated.length,
        toleratedReadable: tolerated.length,
      };
      return {
        kind: "ingredient" as const,
        id: active,
        active,
        name: ACTIVES[active].name,
        confidence: confidenceFor(h),
        ...h,
      };
    })
    /* Most of the associated set first, then the one with the most tolerated
       evidence behind it — the order the argument is strongest in. */
    .sort(
      (a, b) =>
        b.inAssociated.length - a.inAssociated.length ||
        b.toleratedReadable - a.toleratedReadable
    );

  return {
    candidates: all.filter((h) => h.inTolerated.length === 0),
    cleared: all.filter((h) => h.inTolerated.length > 0),
  };
}

/* ---------------------------------------------------------------------------
   The pair pass — hypothesis type B

   "Two or more ingredients that may increase irritation potential when layered
   or used too frequently in the same period. These are context-dependent
   possibilities, not universal incompatibilities."
   -------------------------------------------------------------------------- */

/**
 * `CONFLICTS` pairs whose halves were both in the routine during the window.
 *
 * ⚠️ A NARROWER QUESTION THAN CHECK ASKS OF THE SAME LIST. CHECK asks whether
 * both are in a basket the user is considering. This asks whether both were
 * actually in use in the same period, AND requires at least one half to be new:
 * a pair the user has been running for months without trouble did not start
 * anything, and reporting it here would be CHECK's advice wearing the
 * analysis's clothes.
 */
export function pairs(evidence: ProductEvidence[]): PairHypothesis[] {
  const inRoutine = evidence.filter((e) => e.state !== "unclear" && e.readable);
  const out: PairHypothesis[] = [];

  for (const [x, y] of CONFLICTS) {
    const carriersX = inRoutine.filter((e) => e.actives.includes(x));
    const carriersY = inRoutine.filter((e) => e.actives.includes(y));

    for (const cx of carriersX) {
      for (const cy of carriersY) {
        if (cx.product.id === cy.product.id) continue;
        const isNew =
          cx.state === "associated" || cy.state === "associated";
        if (!isNew) continue;

        out.push({
          kind: "pair",
          id: `${x}|${y}|${cx.product.id}|${cy.product.id}`,
          actives: [x, y],
          products: [cx.product, cy.product],
          bothNew: cx.state === "associated" && cy.state === "associated",
          /* ⚠️ NEVER "stronger". A pair is a context-dependent possibility that
             depends on concentration, formulation and how often the two were
             actually layered — none of which the app knows. The brief is
             explicit: never infer an interaction from ingredient names alone
             without showing uncertainty. */
          confidence: cx.state === "associated" && cy.state === "associated"
            ? "possible"
            : "weak",
        });
      }
    }
  }

  return out;
}

/* ---------------------------------------------------------------------------
   § 07 — the outcome
   -------------------------------------------------------------------------- */

export type Outcome = "leading" | "several" | "none";

export type Analysis = {
  outcome: Outcome;
  /** empty when the analysis ran; the reason it did not when it is `none` */
  gaps: Gap[];
  evidence: ProductEvidence[];
  /** ranked, strongest first. Empty on `none`. */
  hypotheses: Hypothesis[];
  /** the candidates the user's own tolerated history argues against */
  cleared: IngredientHypothesis[];
};

const RANK: Record<Confidence, number> = { stronger: 2, possible: 1, weak: 0 };

/**
 * The hypotheses the screen argues, and the ones it merely lists.
 *
 * ⚠️ EVERY SURVIVING CANDIDATE IS REPORTED, BUT NOT EVERY ONE GETS A CARD. A
 * real routine produces four or five weak candidates — an ingredient in exactly
 * one product, with nothing tolerated to test it against — and giving each of
 * them a full reasoning card buries the leading hypothesis under things the
 * analysis has already said it cannot support. § 07 shows ONE hypothesis for
 * outcome 1; the rest still appear, named and labelled, in a compact list, so
 * nothing is hidden and nothing is dressed up.
 */
export function splitHypotheses(a: Analysis): {
  leading: Hypothesis[];
  alsoConsidered: Hypothesis[];
} {
  const top = a.hypotheses[0];
  if (!top) return { leading: [], alsoConsidered: [] };
  const cut = RANK[top.confidence];
  return {
    leading: a.hypotheses.filter((h) => RANK[h.confidence] === cut),
    alsoConsidered: a.hypotheses.filter((h) => RANK[h.confidence] < cut),
  };
}

export function analyseInvestigation(a: Answers): Analysis {
  const blocking = gaps(a);
  const evidence = evidenceFor(a);

  if (blocking.length > 0) {
    return { outcome: "none", gaps: blocking, evidence, hypotheses: [], cleared: [] };
  }

  const { candidates, cleared } = subtract(evidence);
  const hypotheses: Hypothesis[] = [...candidates, ...pairs(evidence)].sort(
    (x, y) => RANK[y.confidence] - RANK[x.confidence]
  );

  if (hypotheses.length === 0) {
    /* ⚠️ THE GATES PASSED AND THERE IS STILL NO ANSWER, WHICH IS A REAL
       OUTCOME AND NOT A BUG. Everything the associated products share was
       cleared by the tolerated ones, or they share nothing at all. That is
       information — it is just not a culprit. */
    return {
      outcome: "none",
      gaps: [
        {
          id: "ingredients-missing",
          title: "Nothing survived the comparison",
          body:
            cleared.length > 0
              ? `Everything your newer products have in common also appears in products you have used without problems. That argues against all of them, and leaves no candidate.`
              : "Your newer products have no ingredients in common, so there is no shared pattern to follow.",
          href: "/investigation/products",
          action: "Add more products",
        },
      ],
      evidence,
      hypotheses: [],
      cleared,
    };
  }

  /* A leading hypothesis needs to be leading — one hypothesis, or a clear step
     down to the next. Two "possible" patterns is outcome 2, and the screen says
     so rather than picking one. */
  const leading =
    hypotheses.length === 1 ||
    RANK[hypotheses[0].confidence] > RANK[hypotheses[1].confidence];

  return {
    outcome: leading ? "leading" : "several",
    gaps: [],
    evidence,
    hypotheses,
    cleared,
  };
}

/* ---------------------------------------------------------------------------
   § 07 / § 08 — the sentences

   ⚠️ THE COPY IS HERE AND NOT IN THE SCREENS, WHICH IS THE HOUSE RULE ("a
   screen states nothing it could compute from one of these") AND ALSO THE ONLY
   WAY THE VOCABULARY STAYS ENFORCEABLE. These screens add more product-effect
   copy than the rest of the app combined, and the brief's controlled vocabulary
   is a REGULATORY constraint rather than a tone preference — see
   `docs/decisions.md`, "Claim language". Every sentence below is hedged on
   purpose:

     SAY                                   NEVER SAY
     Associated with this reaction         This caused your reaction
     Used without problems                 Safe for you
     Possible contributor / interaction    Toxic ingredient, dangerous product
     Fits your recorded pattern            Guaranteed result
     Not enough evidence yet               Allergy diagnosis
     May have increased irritation when    These two ingredients clashed
       used in the same period

   Keeping it in one module means the forbidden list can be checked by a script
   over this file rather than trusted to whoever writes the next screen.
   -------------------------------------------------------------------------- */

/** The one-line headline § 07 asks for: "This currently fits your recorded
 *  pattern best." Hedged, and never naming a cause. */
export function headline(h: Hypothesis): string {
  if (h.kind === "ingredient") {
    return `A possible contributor: ${h.name}`;
  }
  const [x, y] = h.actives;
  /* ⚠️ `name`, NOT `label`. `ACTIVES.label` is CHECK's ingredient-tag string and
     one of them carries a concentration — "Salicylic Acid 2%" — which this
     screen has just finished saying it does not know. A sentence that names a
     percentage two lines above "concentration and formulation are unknown"
     undoes the hedge. Same reason every other sentence in this file uses
     `name`. */
  return `${ACTIVES[x].name} and ${ACTIVES[y].name}, used in the same period`;
}

/**
 * The bare subject of a hypothesis, without the "A possible contributor:"
 * framing — for the compact list, where `hypothesisKind` already says what
 * species it is and the full headline would repeat it twice in one line.
 */
export function subject(h: Hypothesis): string {
  if (h.kind === "ingredient") return h.name;
  const [x, y] = h.actives;
  return `${ACTIVES[x].name} with ${ACTIVES[y].name}`;
}

/** The type label § 07 asks to show beside the headline. */
export function hypothesisKind(h: Hypothesis): string {
  return h.kind === "ingredient"
    ? "Possible ingredient contributor"
    : "Possible same-routine interaction";
}

/** The products a hypothesis is about. */
export function hypothesisProducts(h: Hypothesis): SavedProduct[] {
  return h.kind === "ingredient" ? h.inAssociated : h.products;
}

/** The § 08 accordions, in the brief's order. An empty array means the section
 *  has nothing to say and the screen omits it — never renders it empty. */
export type Reasoning = {
  relevance: string[];
  profile: string[];
  interactions: string[];
  against: string[];
  excluded: string[];
  couldChange: string[];
};

export function reasoningFor(
  h: Hypothesis,
  analysis: Analysis,
  a: Answers
): Reasoning {
  const associated = analysis.evidence.filter((e) => e.state === "associated");
  const tolerated = analysis.evidence.filter((e) => e.state === "tolerated");
  const unclear = analysis.evidence.filter((e) => e.state === "unclear");
  const unreadable = analysis.evidence.filter((e) => !e.readable);

  const relevance: string[] = [];
  const against: string[] = [];
  const interactions: string[] = [];

  if (h.kind === "ingredient") {
    relevance.push(
      `${h.name} appears in ${count(h.inAssociated.length, "product")} you were using around the time the reaction started: ${h.inAssociated.map(fullName).join(", ")}.`
    );
    if (h.toleratedReadable > 0) {
      relevance.push(
        `It appears in none of the ${count(h.toleratedReadable, "product")} you have used for longer without problems.`
      );
    }

    /* ⚠️ THE CASE AGAINST IS BUILT EVEN WHEN THE CANDIDATE SURVIVED, and this
       is the accordion the brief cares most about. A surviving candidate has no
       tolerated product carrying it — by construction — so the honest counter-
       evidence is what the comparison could NOT rule out. */
    const without = associated.length - h.inAssociated.length;
    if (without > 0) {
      against.push(
        `${count(without, "product")} you were using at the time do not contain it, so it cannot explain ${without === 1 ? "that one" : "those"}.`
      );
    }
    if (h.toleratedReadable < MIN_TOLERATED) {
      against.push(
        "There is very little tolerated history to compare against, so this has not been ruled out so much as never tested."
      );
    }
    const blind = tolerated.filter((e) => !e.readable).length;
    if (blind > 0) {
      against.push(
        `${count(blind, "product")} you tolerate ${blind === 1 ? "has" : "have"} no ingredient list, so ${blind === 1 ? "it" : "they"} could not be checked for it.`
      );
    }
    if (against.length === 0) {
      against.push(
        "Nothing in what you recorded argues against this — which is not the same as evidence for it."
      );
    }
  } else {
    const [x, y] = h.actives;
    interactions.push(
      `${fullName(h.products[0])} contains ${ACTIVES[x].name}; ${fullName(h.products[1])} contains ${ACTIVES[y].name}.`
    );
    interactions.push(
      "Used in the same period, these two may have increased irritation. That is a possibility about your routine, not a reaction between the products."
    );
    interactions.push(
      "Concentration and formulation are unknown, and both change how much this matters."
    );
    relevance.push(
      `Both were in your routine when the reaction started${h.bothNew ? ", and both entered it around the same time" : ""}.`
    );
    if (!h.bothNew) {
      against.push(
        "Only one of the two is new. If you had been using the other for a while without trouble, the pair alone is unlikely to be the whole story."
      );
    }
    against.push(
      "Whether these were actually layered, or used on different days, is not recorded."
    );
  }

  /* ⚠️ THE PROFILE IS CONTEXT, NEVER PROOF — the brief says so in as many
     words: "explain relevance ... without treating them as proof". */
  const profile: string[] = [];
  const skinType = a["skin-type"];
  const tendencies = a.tendencies ?? [];
  const conditions = (a.conditions ?? []).filter((c) => c !== "None");
  if (skinType) {
    profile.push(`You recorded ${skinType.toLowerCase()} skin.`);
  }
  if (tendencies.length > 0) {
    profile.push(
      `You recorded ${tendencies.map((t) => t.toLowerCase()).join(" and ")}, which makes an irritant reaction more likely to show — it does not make this explanation more likely than another.`
    );
  }
  if (conditions.length > 0) {
    profile.push(
      `You recorded ${conditions.join(", ")}. General advice may not apply to you; a pharmacist or doctor can say whether it does.`
    );
  }
  if (profile.length === 0) {
    profile.push(
      "You have not recorded a skin type or tendencies, so nothing here is weighted by them."
    );
  }

  const excluded: string[] = [];
  if (unreadable.length > 0) {
    excluded.push(
      `${count(unreadable.length, "product")} ${unreadable.length === 1 ? "has" : "have"} no ingredient list: ${unreadable.map((e) => fullName(e.product)).join(", ")}.`
    );
  }
  if (unclear.length > 0) {
    excluded.push(
      `${count(unclear.length, "product")} could not be placed on the timeline and ${unclear.length === 1 ? "was" : "were"} left out of the comparison entirely.`
    );
  }
  excluded.push(
    "No ingredient concentration is known for any product here, and the product version you have was not confirmed."
  );

  const couldChange: string[] = [];
  if (unreadable.length > 0) {
    couldChange.push("Ingredient lists for the products that are missing them.");
  }
  if (unclear.length > 0) {
    couldChange.push("Saying when you started the products whose timing is unclear.");
  }
  couldChange.push(
    "Anything you used in the four weeks before the reaction that is not on the list yet — including products you do not suspect."
  );
  couldChange.push(
    "Pausing one product for four weeks and recording what happens. That is the only thing here that produces new evidence rather than rearranging what you already gave me."
  );

  return { relevance, profile, interactions, against, excluded, couldChange };
}

/** "1 product" / "3 products" — used in enough sentences above to be worth
 *  having in one place. */
function count(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}

/** § 08's evidence-against block, at the level of the whole analysis: the
 *  candidates the user's own tolerated history knocked out. */
export function ruledOut(h: IngredientHypothesis): string {
  return `${h.name} — also in ${h.inTolerated.map(fullName).join(" and ")}, which you have used without problems.`;
}

/* ---------------------------------------------------------------------------
   § 11 — investigation priority

   "Show products ranked by INVESTIGATION PRIORITY, not medical risk." The
   distinction is the point: this ranks by how much the user would LEARN from
   pausing a product, not by how dangerous it is. Every card says why it ranks
   where it does.
   -------------------------------------------------------------------------- */

export type PriorityEntry = {
  product: SavedProduct;
  /** why it ranks here — shown verbatim on the card */
  reasons: string[];
  /** what is not known about it, § 11's "missing information" */
  missing: string[];
};

export function investigationPriority(a: Answers): PriorityEntry[] {
  const evidence = evidenceFor(a);
  const tolerated = evidence.filter((e) => e.state === "tolerated" && e.readable);

  return evidence
    .map((e) => {
      const reasons: string[] = [];
      const missing: string[] = [];
      let weight = 0;

      if (e.state === "associated") {
        weight += 100;
        reasons.push("Entered your routine around the time the reaction started");
      } else if (e.state === "unclear") {
        weight += 40;
        reasons.push("Its timing against the reaction is still unclear");
      } else {
        reasons.push("Used without problems for longer than the reaction has lasted");
      }

      const named = e.actives.filter((id) => ACTIVES[id].concern);
      if (named.length > 0) {
        weight += named.length * 10;
        reasons.push(
          `Contains ${named.map((id) => ACTIVES[id].name).join(" and ")}`
        );
      }

      /* An ingredient nothing else in the routine carries is the one a pause
         actually tests — if it is shared, pausing one product proves little. */
      const unique = e.actives.filter(
        (id) => !tolerated.some((t) => t.actives.includes(id))
      );
      if (e.readable && unique.length > 0 && e.state === "associated") {
        weight += 15;
        reasons.push("Nothing you tolerate contains the same ingredients");
      }

      if (!e.readable) {
        missing.push("No ingredient list — nothing to compare");
      }
      if (e.product.bucket === "not-sure") {
        missing.push("How long you have used it");
      }
      if (e.state === "unclear" && !e.confirmed) {
        missing.push("Whether you started it before or after the reaction");
      }

      return { entry: { product: e.product, reasons, missing }, weight };
    })
    .sort((x, y) => y.weight - x.weight)
    .map((r) => r.entry);
}

/* ---------------------------------------------------------------------------
   § 10 — the cautious next action
   -------------------------------------------------------------------------- */

/**
 * ⚠️ TWO PRODUCTS CAN NEVER BE PROPOSED FOR A PAUSE, AND THIS IS AN EXCLUSION
 * IN CODE RATHER THAN A LINE OF COPY. The brief: "Do not recommend pausing
 * prescribed treatment. Do not recommend stopping sunscreen without an
 * appropriate protection plan."
 *
 * The app cannot know what is prescribed — nothing asks — so the honest
 * position is that the pause suggestion is a suggestion the user overrides, and
 * the screen says as much. Sunscreen it CAN recognise, and it is excluded
 * outright: a four-week observation that removes daily UV protection trades one
 * skin problem for a worse one.
 */
export function pausableProducts(entries: PriorityEntry[]): PriorityEntry[] {
  const sunscreen = ROUTINE_ROLES.find((r) => r.id === "sunscreen");
  if (!sunscreen) return entries;
  return entries.filter(
    (e) => !sunscreen.re.test(`${e.product.brand} ${e.product.name}`)
  );
}

/**
 * How long an observation runs.
 *
 * ⚠️ THE SAME FOUR WEEKS AS `ELIMINATION_WEEKS` IN `check.ts`, AND NOT IMPORTED
 * FROM IT. Both come from the brief ("suggested four-week observation period")
 * rather than from each other, and they are different things: CHECK builds a
 * schedule for reintroducing products it scored, this is a single pause on a
 * product the analysis is arguing about. If one moves, the other should be
 * looked at and may well stay — which is not true of a shared constant.
 */
export const OBSERVATION_WEEKS = 4;

/**
 * The one sentence the PROGRESS record carries.
 *
 * ⚠️ IT IS BUILT HERE AND STORED AS A STRING, SO `progress.ts` NEVER IMPORTS
 * THIS MODULE. PROGRESS shows what the investigation concluded; it has no
 * business re-deriving it, and a record that recomputed itself would silently
 * change after the user edited their products — which is the opposite of what a
 * record is for.
 */
export function recordSummary(analysis: Analysis): string {
  const top = analysis.hypotheses[0];
  if (!top) return "No conclusion yet — not enough evidence to point at anything.";
  const others = analysis.hypotheses.length - 1;
  return others > 0
    ? `${headline(top)} — ${CONFIDENCE_LABEL[top.confidence].toLowerCase()}, with ${others} other explanation${others === 1 ? "" : "s"} still open.`
    : `${headline(top)} — ${CONFIDENCE_LABEL[top.confidence].toLowerCase()}.`;
}

/**
 * The product § 10 proposes pausing: the top of the priority list that is
 * allowed to be paused at all. `null` when everything is excluded.
 */
export function suggestedPause(a: Answers): PriorityEntry | null {
  return pausableProducts(investigationPriority(a))[0] ?? null;
}

/** Every product in the analysis, with the name the screens show. */
export function describe(p: SavedProduct): string {
  return fullName(p);
}
