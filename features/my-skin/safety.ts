/** Step 1's symptom vocabulary, and the one safety rule derived from it. */

/** The symptom chips on step 1. */
export const SYMPTOMS = [
  "Redness",
  "Itching",
  "Dryness",
  "Breakouts",
  "Irritation",
  "Swelling",
  "Flaking",
  "Rash",
] as const;

export type Symptom = (typeof SYMPTOMS)[number];

/**
 * The symptoms that raise the notice.
 *
 * These two are the only members of the brief's trigger list that step 1
 * actually collects, and both are ambiguous by design — the chip cannot tell a
 * swollen lip from a swollen cheek, or a spreading rash from a patch on one
 * cheek. That ambiguity is exactly why the notice asks the reader to judge
 * rather than announcing a conclusion.
 */
export const SAFETY_SYMPTOMS: readonly Symptom[] = ["Swelling", "Rash"];

/** Whether the selected symptoms are ones LUX should hand back to a person. */
export function needsProfessionalNotice(selected: readonly string[]): boolean {
  return selected.some((s) => (SAFETY_SYMPTOMS as readonly string[]).includes(s));
}

/** The notice's own words. */
export const SAFETY_NOTICE = {
  label: "Before you continue",
  body:
    "LUX can't judge how serious a reaction is. If yours is severe, spreading fast, or affecting your eyes, lips or breathing, please see a doctor or pharmacist.",
} as const;
