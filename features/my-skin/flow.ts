/** The investigation flow. */
import { symptomsOf, type Answers } from "@/lib/store/answers";

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
  /** The screen's name, and its `<h1>`. */
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
  /** Where back and Continue go when the array neighbour is the wrong answer. */
  back?: string;
  next?: string;
};

export const STEPS: Step[] = [
  // Start (01, 476:2542/476:2670) and Location (03b, 476:2802/476:2934)
// combined onto one screen — see components/StartInvestigation.tsx. Continue
// needs both answers, which used to gate two separate steps.
  { id: "start",      step: 1, href: "/investigation/start",      title: "Create skin profile", figma: { mobile: "476:2542", desktop: "476:2670" }, isComplete: (a) => symptomsOf(a).length > 0, next: "/investigation/skin-type" },
  // Skin type (02a, 484:722/489:902) and Skin tendencies (02b, 485:755/489:960)
  // combined onto one screen — see components/SkinType.tsx. Continue needs
  // both answers, which used to gate two separate steps.
  { id: "skin-type",  step: 2, href: "/investigation/skin-type",  title: "Skin type", figma: { mobile: "484:722",  desktop: "489:902"  }, isComplete: (a) => Boolean(a["skin-type"]) && (a.tendencies?.length ?? 0) > 0 },
    // 02c is genuinely OPTIONAL — the screen says "This is optional — skip if you
  // prefer" and carries a "Skip this question" link — so Continue is available
  // from the start. The only requirement is that a ticked "Other" is filled in.
  { id: "conditions", step: 3, href: "/investigation/conditions", title: "Known conditions", figma: { mobile: "476:2566", desktop: "476:2695" }, isComplete: (a) => otherIsFilled(a.conditions, a.conditionsOther) },
  { id: "timing",     step: 4, href: "/investigation/timing",     title: "Timing", figma: { mobile: "488:851",  desktop: "491:1031" }, isComplete: (a) => Boolean(a.timing?.date && a.timing?.status), next: "/investigation/profile" },

  { id: "products", step: 5, href: "/investigation/products", title: "Your products", figma: { mobile: "574:1342", desktop: "582:1612" }, isComplete: () => true, back: "/investigation/profile", next: "/investigation/analysis" },
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
