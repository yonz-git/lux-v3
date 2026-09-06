/**
 * The investigation flow.
 *
 * ⚠️ THE FLOW IS 5 STEPS, NOT 8. It was 8 until Skin type (02a) and Skin
 * tendencies (02b) were combined onto one screen at `skin-type`, Observable
 * symptoms (03a) was dropped entirely, and Start investigation (01) and
 * Location (03b) were combined onto one screen at `start` — all three
 * prototype-only changes with no matching Figma frame yet (see the doc
 * comments on `components/SkinType.tsx` and `components/StartInvestigation.tsx`).
 * Products still sits between Timing and Investigating and shows a progress
 * track, so it keeps its own step — it is just ONE screen now rather than six
 * (see the step itself). Verified: the track fill on 01 is 1/5, not 1/8.
 *
 * A screen belongs to this flow if and only if it carries BOTH a progress track
 * AND `Save & exit` — those two together mean "resumable step". Hub screens
 * reached from the bottom nav (Check, Products, Progress) get neither.
 */
import type { Answers } from "@/lib/store/answers";

export const TOTAL_STEPS = 5;

export type StepId =
  | "start"
  | "skin-type"
  | "conditions"
  | "timing"
  | "products";

export type Step = {
  id: StepId;
  /** 1-based position on the progress track. */
  step: number;
  href: string;
  /** Figma frame ids, so the next person can diff code against the design. */
  figma: { mobile: string; desktop: string };
  /**
   * The screen's name, and its `<h1>`.
   *
   * ⚠️ EVERY SCREEN NEEDS ONE. Most of these screens pose their question inside
   * a chat bubble, which is a div — so before this there was no heading on any
   * flow screen at all, and a screen-reader user landing on one got no page
   * title and nothing to navigate by (WCAG 1.3.1 / 2.4.6). The four screens that
   * show a title visibly render this same string; the rest render it
   * visually-hidden. One source of truth either way, and it lives on the step
   * for the same reason `isComplete` does — a new screen cannot forget it.
   *
   * These are the Figma frame names, not new copy — with ONE exception. Step 1
   * is titled `Create skin profile`, not the frame's `Start investigation`: the
   * flow is now a nav section called `My skin`, and every link into it in the
   * app says `Create skin profile`, which is the label `Check — no profile`
   * (606:2183) already gives that exact destination. Naming the section, the
   * three CTAs and the screen four different things for one place was the
   * confusion; the frame name is the odd one out and Figma catches up.
   */
  title: string;
  /**
   * Whether this step has been answered. Drives the Continue button: it stays
   * DISABLED until the required answer exists, and only then becomes available.
   *
   * The Figma frames show options already selected because a design comp has to
   * show what a filled-in screen looks like. The prototype starts EMPTY — the
   * user does the selecting.
   */
  isComplete: (a: Answers) => boolean;
  /**
   * Where back and Continue go when the array neighbour is the wrong answer.
   *
   * ⚠️ PRODUCTS USED TO BE A FORK AND IS A LINE AGAIN. "Add product" opened a
   * method sheet whose search and scan branches rejoined at `Product added`,
   * across six routed screens sharing one track position. The whole add flow
   * now happens inside the tray on one screen, so nothing forks and only
   * `products` still names its own `next` — the last step in the array has no
   * neighbour to fall through to.
   */
  back?: string;
  next?: string;
};

export const STEPS: Step[] = [
  // Start (01, 476:2542/476:2670) and Location (03b, 476:2802/476:2934)
  // combined onto one screen — see components/StartInvestigation.tsx. Continue
  // needs both answers, which used to gate two separate steps.
  //
  // ⚠️ SELFIE CAPTURE (03b, 487:834/490:1041) IS NO LONGER A STEP AT ALL. It
  // was listed here at step 1 — sharing this screen's number, so it never moved
  // the track — because it was a routed screen with a track to move. It is the
  // tray overlay `components/SelfieSheet.tsx` now, opened by "Take a photo"
  // without leaving the page, so it has no route, no track and nothing for this
  // file to own. Frame ids are kept on the component.
  //
  // ⚠️ THIS IS ALSO THE `My skin` NAV LANDING. It keeps its back chevron, its
  // track and its `Save & exit` — it is a flow step that the nav happens to
  // point at, not a hub, and the "no back chevron on a hub landing" rule does
  // not reach it. See `components/BottomNav.tsx`.
  { id: "start",      step: 1, href: "/investigation/start",      title: "Create skin profile", figma: { mobile: "476:2542", desktop: "476:2670" }, isComplete: (a) => (a.start?.length ?? 0) > 0 && (a.location?.length ?? 0) > 0, next: "/investigation/skin-type" },
  // Skin type (02a, 484:722/489:902) and Skin tendencies (02b, 485:755/489:960)
  // combined onto one screen — see components/SkinType.tsx. Continue needs
  // both answers, which used to gate two separate steps.
  { id: "skin-type",  step: 2, href: "/investigation/skin-type",  title: "Skin type", figma: { mobile: "484:722",  desktop: "489:902"  }, isComplete: (a) => Boolean(a["skin-type"]) && (a.tendencies?.length ?? 0) > 0 },
    // 02c is genuinely OPTIONAL — the screen says "This is optional — skip if you
  // prefer" and carries a "Skip this question" link — so Continue is available
  // from the start. The only requirement is that a ticked "Other" is filled in.
  { id: "conditions", step: 3, href: "/investigation/conditions", title: "Known conditions", figma: { mobile: "476:2566", desktop: "476:2695" }, isComplete: (a) => otherIsFilled(a.conditions, a.conditionsOther) },
  // ⚠️ TIMING CONTINUES TO `/check/new`, NOT TO STEP 5 — decided 6 Sep 2026, and
  // it is the first move of the CHECK/analysis merge rather than a reroute.
  // `/investigation/products` and `/check/new` were two screens doing the same
  // job — search a catalogue, build a list of your products — in two sections
  // with two vocabularies, which is the "analysis, check and investigation
  // should be one thing" problem in its most concrete form. The flow now hands
  // off to the shared builder.
  //
  // ⚠️ AND STEP 5 IS STILL A STEP, STILL 5/5, AND STILL REACHABLE. It is not
  // deleted: the Products tab links to it and `TOTAL_STEPS` is unchanged. It is
  // simply no longer the only way through, while the merge is decided.
  //
  // ⚠️ THE OPEN PROBLEM, WRITTEN HERE BECAUSE IT IS INVISIBLE FROM THE ROUTE:
  // `/check/new` collects PRODUCTS, not DURATIONS. Step 5 asks "how long have
  // you used this?" once per product, and that answer is the entire mechanism
  // of the analysis — `bucketFor` turns it into a group and `deriveEvidence`
  // compares that against step 4's flare date. A basket built at `/check/new`
  // has no timeline, so the analysis can only refuse. See the note in
  // `features/my-skin/analysis.ts` and "the naming" in `docs/decisions.md`:
  // the builder needs the duration question before this hand-off is finished.
  { id: "timing",     step: 4, href: "/investigation/timing",     title: "Timing", figma: { mobile: "488:851",  desktop: "491:1031" }, isComplete: (a) => Boolean(a.timing?.date && a.timing?.status), next: "/check/new" },

  // ---- Step 5: PRODUCTS ---------------------------------------------------
  // ⚠️ ONE SCREEN NOW, NOT SIX. `Add products intro`, `Long-term products` and
  // the four routed add-flow screens (`search`, `confirm`, `scan`, `match`)
  // shared this one track position; all six are gone. The briefing merged into
  // the list screen and the entire add flow — method, search-or-scan, confirm,
  // duration — plays out inside `AddProductMethodSheet` without ever leaving
  // the page. `Product added` went with them: it existed to announce a
  // navigation that no longer happens.
  //
  // Complete on arrival rather than gating Continue on a product: the step is
  // genuinely optional and the screen says so ("None — skip to next"). Same
  // call 02c makes, and it belongs here rather than in the screen.
  //
  // ⚠️ CONTINUE ENDS THE FLOW AT THE ANALYSIS NOW, NOT AT THE PRODUCTS HUB.
  // It pointed at `/products` while the analysis had no route — the note here
  // said "the real destination once INVESTIGATION lands is 05 — Investigating",
  // and it has landed: `/investigation/analysis`, which is ONE screen (it was
  // three). See `features/my-skin/analysis.ts`.
  //
  // ⚠️ AND THE ANALYSIS IS NOT A STEP. It carries no progress track and no
  // `Save & exit`, so by the rule at the top of this file it is not in `STEPS`
  // and `TOTAL_STEPS` is still 5. The flow COLLECTS; the analysis REPORTS on
  // what it collected.
  { id: "products", step: 5, href: "/investigation/products", title: "Your products", figma: { mobile: "574:1342", desktop: "582:1612" }, isComplete: () => true, next: "/investigation/analysis" },
];

/**
 * The PRODUCTS screens that are NOT investigation steps — hub views reached
 * from the bottom nav, with no progress track and no `Save & exit`. Listed here
 * only so the Figma frame ids stay next to the flow they belong to.
 */
export const PRODUCT_HUB_SCREENS = {
  hub: { href: "/products", figma: { mobile: "579:1574", desktop: "583:1863" }, filled: { mobile: "579:1607", desktop: "583:1889" } },
  bucketList: { href: "/products/long-term", figma: { mobile: "581:1593", desktop: "583:1924" } },
} as const;

/**
 * A ticked "Other" with an empty field is not an answer, so it must not unlock
 * Continue. Steps where "Other" is absent are unaffected.
 */
function otherIsFilled(selected?: string[], text?: string): boolean {
  if (!selected?.includes("Other")) return true;
  return Boolean(text?.trim());
}

export function stepFor(id: StepId): Step {
  const s = STEPS.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown step: ${id}`);
  return s;
}

/**
 * The screen before this one — the step's own `back` when it names one, else
 * the array neighbour. `start` goes back to Welcome, which is not a step.
 */
export function prevHref(id: StepId): string {
  const i = STEPS.findIndex((x) => x.id === id);
  if (i < 0) return "/";
  return STEPS[i].back ?? (i === 0 ? "/" : STEPS[i - 1].href);
}

/**
 * The screen after this one — the step's own `next` when it names one, else the
 * array neighbour. The last step has no destination yet.
 */
export function nextHref(id: StepId): string | null {
  const i = STEPS.findIndex((x) => x.id === id);
  if (i < 0) return null;
  return STEPS[i].next ?? (i < STEPS.length - 1 ? STEPS[i + 1].href : null);
}
