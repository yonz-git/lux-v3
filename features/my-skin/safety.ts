/**
 * Step 1's symptom vocabulary, and the one safety rule derived from it.
 *
 * ⚠️ THIS IS A SCOPE STATEMENT, NOT A TRIAGE, AND THE DIFFERENCE IS THE WHOLE
 * DESIGN. `docs/product-brief.md` § 03E asks the flow to interrupt on nine
 * clinical triggers — breathing difficulty, swelling of lips/tongue/throat,
 * major eye involvement, and six more — which would mean asking nine medical
 * questions and then deciding, in the app, whether the answers are serious.
 * That is the app performing an assessment, and LUX does not do assessments.
 *
 * What ships instead: LUX states the limit of what it can see, names the kinds
 * of reaction that outrun it, and leaves the judgement with the person who can
 * actually look at the skin. The app never concludes that a case IS severe —
 * the sentence is conditional, and the condition is the reader's to evaluate.
 *
 * ⚠️ IT DOES NOT BLOCK `Continue`, DELIBERATELY. A gate would be the app acting
 * on a severity judgement it just declined to make, and a hard stop on two
 * ambiguous chips ("Swelling" is a puffy cheek as often as it is a lip) trains
 * people to click past the one message that matters. Non-blocking is the call;
 * revisit it only alongside a real triage question set, which is a product and
 * legal decision rather than a code one.
 *
 * ⚠️ AND IT GIVES NO EMERGENCY NUMBER. The app has no locale, and a wrong
 * number is worse than none. A release that ships to a known market should
 * carry the local one — see `docs/decisions.md`.
 */

/**
 * The symptom chips on step 1.
 *
 * ⚠️ THE LIST LIVES HERE, NOT IN THE SCREEN, SO THE TRIGGERS CANNOT DRIFT FROM
 * IT. `SAFETY_SYMPTOMS` below is typed as a subset of this array, so renaming a
 * chip in one place and not the other is a compile error rather than a safety
 * notice that silently stops appearing. That is the only reason a chip list is
 * filed under a module named for the safety rule.
 */
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

/**
 * The notice's own words.
 *
 * ⚠️ CHECKED AGAINST THE BRIEF'S CONTROLLED VOCABULARY (§ "UX vocabulary", and
 * the audit in `docs/decisions.md`). It claims no cause, names no allergy, and
 * calls no product dangerous — it describes what LUX does and what it cannot
 * see. `doctor or pharmacist` rather than the `dermatologist` `CheckResults`
 * points at: a dermatology referral is the right destination for a slow
 * pattern question and the wrong one for something that is getting worse today.
 *
 * ⚠️ 27 WORDS, DOWN FROM 46, AND THE CUT KEPT THREE THINGS ON PURPOSE. A safety
 * message nobody finishes reading is not a safety message, and the first draft
 * opened with a clause about what LUX does before reaching the point. What
 * survives is the limit (`can't judge how serious`), the CONDITIONAL that keeps
 * the severity judgement with the reader (`if yours is`), and the named signs —
 * eyes, lips, breathing — which are the brief's § 03E triggers in plain words
 * and the only part that tells someone whether this is about them. What went:
 * the framing sentence, `mouth` (bracketed by `lips` and `breathing`), and
 * `rather than waiting on an investigation`, which the `Before you continue`
 * label already says.
 */
export const SAFETY_NOTICE = {
  label: "Before you continue",
  body:
    "LUX can't judge how serious a reaction is. If yours is severe, spreading fast, or affecting your eyes, lips or breathing, please see a doctor or pharmacist.",
} as const;
