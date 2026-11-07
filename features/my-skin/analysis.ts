/**
 * THE ANALYSIS — the retrospective one, the thing LUX is named for.
 *
 * Source: `docs/product-brief.md` §§ 05–12, "Analysis model to communicate
 * through the UI". Nothing in Figma covers it — page `06.
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
import { ownedProducts } from "@/features/products/library";

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
  "not-sure": null,
};

/**
 * How long before the reaction started a product could have been introduced and
 * still be a plausible suspect.
 */
export const LEAD_IN_DAYS = 14;

/**
 * Where a product sits relative to the reaction. The brief's three states,
 * verbatim from its controlled vocabulary — see `docs/product-brief.md`
 * § "UX vocabulary". Do not rename these to anything stronger.
 */
export type EvidenceState = "associated" | "tolerated" | "unclear";

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

  return ownedProducts(a).map((product) => {
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
   § 06 — what the analysing state says it is doing
   -------------------------------------------------------------------------- */

/** The six passes, in the brief's own words — § 06, verbatim. */
export const ANALYSIS_PASSES = [
  "Comparing when each product was introduced",
  "Finding ingredients shared by the newer ones",
  "Checking those against what you already tolerate",
  "Checking for combinations used in the same period",
  "Considering your skin type and symptoms",
  "Checking what the ingredient data cannot tell us",
] as const;

/* § 05 — the two gates, and everything that is NOT one */

export type GapId =
  | "no-flare-date"
  | "nothing-to-compare"
  | "unresolved-timeline";

export type Gap = {
  id: GapId;
  /** what is missing, in the user's words */
  title: string;
  /** why it is needed — ONE short sentence, never a paragraph */
  body: string;
  /** Where the user goes to fix it — ABSENT when the fix is on this screen. */
  href?: string;
  action?: string;
};

/** Tolerated products carrying an ingredient list. */
const MIN_TOLERATED = 2;

export type RoutineRole = "cleanser" | "sunscreen";

/** The two routine roles worth reminding someone about. */
const ROUTINE_ROLES: { id: RoutineRole; label: string; re: RegExp }[] = [
  { id: "cleanser", label: "cleanser", re: /cleans|wash|foaming|micellar|makeup remover/i },
  { id: "sunscreen", label: "sunscreen", re: /spf|sunscreen|sun cream|uv\b|fluid uv/i },
];

function hasRole(products: SavedProduct[], re: RegExp): boolean {
  return products.some((p) => re.test(`${p.brand} ${p.name} ${p.description ?? ""}`));
}

/** Roles the user has not added — for a REMINDER, not a requirement. */
export function forgottenRoles(a: Answers): string[] {
  /* the same list the comparison ran on — see `evidenceFor` */
  const products = ownedProducts(a);
  return ROUTINE_ROLES.filter((role) => !hasRole(products, role.re)).map(
    (r) => r.label
  );
}

/**
 * What stops the analysis — at most one thing, and only when there is genuinely
 * nothing to compare. An empty array means it runs.
 */
export function gaps(a: Answers): Gap[] {
  if (!a.timing?.date) {
    return [
      {
        id: "no-flare-date",
        title: "When did your skin change?",
        body: "Your products are compared against that day.",
        href: "/investigation/timing",
        action: "Add the date",
      },
    ];
  }

  const evidence = evidenceFor(a);
  const suspects = evidence.filter((e) => e.state === "associated");
  const readable = evidence.filter((e) => e.readable);
  const straddling = evidence.filter((e) => e.state === "unclear");

  if (suspects.length === 0 && straddling.length > 0) {
    const one = straddling.length === 1;
    return [
      {
        id: "unresolved-timeline",
        title: one
          ? "One product could go either way"
          : `${straddling.length} products could go either way`,
        body: one
          ? "Say whether you started it around the reaction and the comparison can run."
          : "Say whether you started them around the reaction and the comparison can run.",
      },
    ];
  }

  if (suspects.length === 0 || readable.length === 0) {
    return [
      {
        id: "nothing-to-compare",
        title:
          suspects.length === 0
            ? "Nothing in your list is new"
            : "No ingredient lists to compare",
        body:
          suspects.length === 0
            ? "Add anything you started in the four weeks before your skin changed, including products you do not suspect."
            : "None of your products came with an ingredient list, so there is nothing to compare between them.",
        href: "/investigation/products",
        action: "Add products",
      },
    ];
  }

  return [];
}

/* ---------------------------------------------------------------------------
   § 05 — the confirmation list

   "Do not force the user to label every product suspicious or safe. Show a
   compact confirmation list only when the AI's interpretation is ambiguous."
   -------------------------------------------------------------------------- */

/**
 * The products whose timeline straddles the boundary. Exactly these get a
 * question, and no others.
 */
export function needsConfirmation(a: Answers): ProductEvidence[] {
  return evidenceFor(a).filter((e) => e.state === "unclear" || e.confirmed);
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

/** The confidence word, from the shape of the subtraction and nothing else. */
function confidenceFor(h: {
  inAssociated: unknown[];
  inTolerated: unknown[];
  associatedTotal: number;
  toleratedReadable: number;
}): Confidence {
  /* A tolerated product carries it too, so the user's own history argues
     against it — it should not be a candidate at all, and `subtract` moves it
     to `cleared`. Weak is the floor for the case where it slips through. */
  if (h.inTolerated.length > 0) return "weak";
  /* One product is a coincidence, not a pattern. */
  if (h.inAssociated.length < 2) return "weak";
  if (h.toleratedReadable === 0) return "weak";
  if (
    h.inAssociated.length === h.associatedTotal &&
    h.toleratedReadable >= MIN_TOLERATED
  ) {
    return "stronger";
  }
  return "possible";
}

/** Both halves of the case, from one pass. */
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

/** `CONFLICTS` pairs whose halves were both in the routine during the window. */
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

/** The hypotheses the screen argues, and the ones it merely lists. */
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

/**
 * The verdict sentence for outcome `several` — two or more explanations that
 * the subtraction cannot separate.
 */
export function severalVerdict(analysis: Analysis): string {
  const { leading } = splitHypotheses(analysis);
  const products = leading.flatMap((h) => hypothesisProducts(h));
  const ids = new Set(products.map((p) => p.id));
  const shared = ids.size === 1 ? products[0] : null;
  const two = leading.length === 2;

  const evenly = two
    ? "Neither is better supported than the other"
    : "None is better supported than the others";

  if (shared) {
    return `${evenly}, and ${two ? "both" : "all"} are in ${fullName(shared)}.`;
  }
  return `${evenly}, so here ${two ? "are both" : "they all are"}.`;
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
    return {
      outcome: "none",
      gaps: [
        {
          id: "nothing-to-compare",
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

/* § 07 / § 08 — the sentences */

/** The one-line headline § 07 asks for: "This currently fits your recorded
 *  pattern best." Hedged, and never naming a cause. */
export function headline(h: Hypothesis): string {
  if (h.kind === "ingredient") {
    return `A possible contributor: ${h.name}`;
  }
  const [x, y] = h.actives;
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
    ? "Possible contributor"
    : "Possible interaction";
}

/** The whole answer in one line, for the verdict card. */
export function verdictLine(analysis: Analysis): string {
  const top = analysis.hypotheses[0];
  if (!top) return "Nothing survived the comparison.";

  if (top.kind === "pair") {
    return `${subject(top)}, used in the same period, which may have added up.`;
  }

  const inAll = top.inAssociated.length === top.associatedTotal;
  const where = inAll
    ? "in everything you started recently"
    : `in ${top.inAssociated.length} of the ${top.associatedTotal} you started recently`;
  const against =
    top.toleratedReadable > 0
      ? `, and in none of the ${top.toleratedReadable} you have used for longer`
      : ", though there is nothing older to compare it against";

  return `${top.name}, ${where}${against}.`;
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
        "Nothing in what you recorded argues against this, which is not the same as evidence for it."
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

  const profile: string[] = [];
  const skinType = a["skin-type"];
  const tendencies = a.tendencies ?? [];
  const conditions = (a.conditions ?? []).filter((c) => c !== "None");
  if (skinType) {
    profile.push(`You recorded ${skinType.toLowerCase()} skin.`);
  }
  if (tendencies.length > 0) {
    profile.push(
      `You recorded ${tendencies.map((t) => t.toLowerCase()).join(" and ")}, which makes an irritant reaction more likely to show, it does not make this explanation more likely than another.`
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
    "Anything you used in the four weeks before the reaction that is not on the list yet, including products you do not suspect."
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
  return `${h.name}, also in ${h.inTolerated.map(fullName).join(" and ")}, which you have used without problems.`;
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
        missing.push("No ingredient list, nothing to compare");
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

export function pausableProducts(entries: PriorityEntry[]): PriorityEntry[] {
  const sunscreen = ROUTINE_ROLES.find((r) => r.id === "sunscreen");
  if (!sunscreen) return entries;
  return entries.filter(
    (e) => !sunscreen.re.test(`${e.product.brand} ${e.product.name}`)
  );
}

/** How long an observation runs. */
export const OBSERVATION_WEEKS = 4;

/** The one sentence the PROGRESS record carries. */
export function recordSummary(analysis: Analysis): string {
  const top = analysis.hypotheses[0];
  if (!top) return "No conclusion yet, not enough evidence to point at anything.";
  const others = analysis.hypotheses.length - 1;
  return others > 0
    ? `${headline(top)}, ${CONFIDENCE_LABEL[top.confidence].toLowerCase()}, with ${others} other explanation${others === 1 ? "" : "s"} still open.`
    : `${headline(top)}, ${CONFIDENCE_LABEL[top.confidence].toLowerCase()}.`;
}

/**
 * The product § 10 proposes pausing: the top of the priority list that is
 * allowed to be paused at all. `null` when everything is excluded.
 */
export function suggestedPause(a: Answers): PriorityEntry | null {
  return pausableProducts(investigationPriority(a))[0] ?? null;
}

