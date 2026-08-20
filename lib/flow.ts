/**
 * The investigation flow.
 *
 * ⚠️ THE FLOW IS 8 STEPS, NOT 7. Products sits between 03c Timing and
 * 05 Investigating, and every add-flow screen shows a progress track. Leaving
 * this at 7 would make Timing display a full track with product screens still
 * to come. Verified against Figma: the track fill on 01 is 49/392 (1/8) and on
 * 02a is 98/392 (2/8).
 *
 * A screen belongs to this flow if and only if it carries BOTH a progress track
 * AND `Save & exit` — those two together mean "resumable step". Hub screens
 * reached from the bottom nav (Check, Products, Progress) get neither.
 */
import type { Answers } from "./answers";

export const TOTAL_STEPS = 8;

export type StepId =
  | "start"
  | "skin-type"
  | "tendencies"
  | "conditions"
  | "symptoms"
  | "location"
  | "selfie"
  | "timing"
  | "products";

export type Step = {
  id: StepId;
  /** 1-based position on the progress track. Selfie shares Location's step. */
  step: number;
  href: string;
  /** Figma frame ids, so the next person can diff code against the design. */
  figma: { mobile: string; desktop: string };
  /**
   * Whether this step has been answered. Drives the Continue button: it stays
   * DISABLED until the required answer exists, and only then becomes available.
   *
   * The Figma frames show options already selected because a design comp has to
   * show what a filled-in screen looks like. The prototype starts EMPTY — the
   * user does the selecting.
   */
  isComplete: (a: Answers) => boolean;
};

export const STEPS: Step[] = [
  { id: "start",      step: 1, href: "/investigation/start",      figma: { mobile: "476:2542", desktop: "476:2670" }, isComplete: (a) => (a.start?.length ?? 0) > 0 },
  { id: "skin-type",  step: 2, href: "/investigation/skin-type",  figma: { mobile: "484:722",  desktop: "489:902"  }, isComplete: (a) => Boolean(a["skin-type"]) },
  { id: "tendencies", step: 3, href: "/investigation/tendencies", figma: { mobile: "485:755",  desktop: "489:960"  }, isComplete: (a) => (a.tendencies?.length ?? 0) > 0 },
    // 02c is genuinely OPTIONAL — the screen says "This is optional — skip if you
  // prefer" and carries a "Skip this question" link — so Continue is available
  // from the start. The only requirement is that a ticked "Other" is filled in.
  { id: "conditions", step: 4, href: "/investigation/conditions", figma: { mobile: "476:2566", desktop: "476:2695" }, isComplete: (a) => otherIsFilled(a.conditions, a.conditionsOther) },
    { id: "symptoms",   step: 5, href: "/investigation/symptoms",   figma: { mobile: "486:785",  desktop: "490:965"  }, isComplete: (a) => (a.symptoms?.length ?? 0) > 0 && otherIsFilled(a.symptoms, a.symptomsOther) },
  { id: "location",   step: 6, href: "/investigation/location",   figma: { mobile: "476:2802", desktop: "476:2934" }, isComplete: (a) => (a.location?.length ?? 0) > 0 },
  { id: "selfie",     step: 6, href: "/investigation/selfie",     figma: { mobile: "487:834",  desktop: "490:1041" }, isComplete: (a) => Boolean(a.selfie) },
  { id: "timing",     step: 7, href: "/investigation/timing",     figma: { mobile: "488:851",  desktop: "491:1031" }, isComplete: (a) => Boolean(a.timing?.date && a.timing?.onset && a.timing?.status) },
  { id: "products",   step: 8, href: "/investigation/products",   figma: { mobile: "574:1342", desktop: "582:1612" }, isComplete: (a) => (a.products?.length ?? 0) > 0 },
];

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

/** The screen before this one. `start` goes back to Welcome, which is not a step. */
export function prevHref(id: StepId): string {
  const i = STEPS.findIndex((x) => x.id === id);
  return i <= 0 ? "/" : STEPS[i - 1].href;
}

/** The screen after this one. The last built step has no destination yet. */
export function nextHref(id: StepId): string | null {
  const i = STEPS.findIndex((x) => x.id === id);
  return i >= 0 && i < STEPS.length - 1 ? STEPS[i + 1].href : null;
}
