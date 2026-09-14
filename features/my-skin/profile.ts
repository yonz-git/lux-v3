/**
 * The skin profile RECAP — everything steps 1–4 collected, read back as one
 * screen. `/investigation/profile`, between Timing and Products.
 *
 * ⚠️ IT IS NOT A STEP, AND `TOTAL_STEPS` IS STILL 5. It carries no progress
 * track and no `Save & exit`, which by the rule at the top of `flow.ts` is
 * exactly what makes it not one. The five steps COLLECT; this REPORTS what they
 * collected, and then hands off to the products list. Same standing
 * `/investigation/analysis` has — it lives under `/investigation` because it is
 * about the investigation, not because it is a sixth question. **Do not add it
 * to `STEPS`.**
 *
 * ⚠️ EVERY STRING THE SCREEN PUTS ON THE PAGE COMES FROM HERE. That is the
 * standing rule for a section's data module (`flow.ts`, `safety.ts`,
 * `analysis.ts` all work this way) and it has a second payoff on this screen in
 * particular: the recap restates the user's own words back at them, so if it
 * ever starts characterising a symptom rather than echoing it, the drift is
 * visible in one file that `npm run vocab` can read.
 *
 * ⚠️ IT DELIBERATELY DOES NOT USE `skinProfile()` FROM `lib/demo.ts`, AND THAT
 * IS THE ONE SURPRISING THING IN HERE. That helper is how PROGRESS and CHECK
 * resolve the profile, and it falls back to `DEMO_PROFILE` when the store is
 * empty so a readout tab never opens blank. Correct there, wrong here: this
 * screen's entire claim is "here is what YOU just told us", and answering a
 * deep link with "Combination · Sensitive · Acne-prone" would put words in the
 * user's mouth — the demo asserting itself as their answer. So this reads the
 * raw answers and `isEmpty` renders a real empty state instead. The two are not
 * in conflict: `skinProfile()` owns what the DEMO's profile is, this owns what
 * the USER has actually said.
 *
 * ⚠️ IT RETURNS GROUPS, NOT `label: value` LINES — CHANGED 7 Sep 2026, AND THE
 * REASON IS WHAT THE ANSWERS ACTUALLY ARE. The first build flattened every
 * answer into one string ("Redness, Itching, Dryness") under a generic heading,
 * which threw away the two things that make each answer readable: a multi-
 * select is a SET, so it wants pills rather than a sentence with commas in it;
 * and a face region is a PLACE, so it wants the diagram it was picked on rather
 * than its own name. The screen therefore gets `symptoms`, `faceRegions`,
 * `otherLocations`, `conditions` and `timeline` as data and decides how each
 * one is drawn. See `SkinProfileSummary.tsx`.
 */
import { areasOf, symptomsOf, type Answers } from "@/lib/store/answers";
import { FACE_REGION_IDS } from "@/features/my-skin/components/FaceDiagram";
import { daysBetween, formatLong, fromIso } from "@/lib/date";

/**
 * When it started, and where it has got to since.
 *
 * ⚠️ TWO ANSWERS FROM ONE STEP, KEPT TOGETHER BECAUSE THEY ARE ONE FACT. Step 4
 * asks for a date and a status; apart they are "12 August 2026" and "Getting
 * worse", which is a date with no subject and a judgement with no subject.
 * Together they are a span of time with a near end and a far end, which is the
 * only shape either of them means anything in — and it is the shape the screen
 * draws.
 */
export type ProfileTimeline = {
  /** step 4's date, written out */
  started: string;
  /**
   * The span counted forwards from it — "Day 16".
   *
   * ⚠️ DAYS, NEVER WEEKS OR MONTHS, AND NUMBERED FROM ONE. The analysis
   * compares this same span against each product's four coarse duration
   * buckets, so a recap saying "about 3 weeks" over a date the engine reads as
   * 18 days is the screen and the engine telling the user two different things
   * about one fact. And the day it started is day 1, not day 0 — the way a
   * treatment log numbers them. Null for a date in the FUTURE, which
   * `DateField` will not offer but a deep link is not obliged to be sensible
   * about; the line says nothing rather than counting backwards.
   */
  day: string | null;
  /** step 4's status radio, the user's own word for where it has got to */
  status: string | null;
};

/** Everything steps 1–4 collected, grouped the way the recap draws it. */
export type ProfileRecap = {
  /** step 2 — the single-select */
  skinType: string | null;
  /** step 2 — the multi-select beside it */
  tendencies: string[];
  /** step 1 — what the user ticked on the symptom grid */
  symptoms: string[];
  /** step 1 — the locations that are pills ON the face diagram */
  faceRegions: string[];
  /** step 1 — "Whole face", "Neck", "Other": the chips under the diagram */
  otherLocations: string[];
  /**
   * step 1 — each symptom and the places marked for it, which the diagram draws
   * as callouts: a pill at its edge per symptom, with a line to each place.
   *
   * ⚠️ THE SYMPTOMS' ONLY DRAWING ON THIS SCREEN, since 14 Sep 2026 — asked for
   * directly. They were pills in the `What you noticed` block until 13 Sep 2026,
   * removed with the promise that they would move onto the face, and this is
   * that move. A symptom placed only on `Other` has no coordinate and so no
   * callout; its place is still the lit `Other` chip.
   */
  places: NonNullable<Answers["start"]>;
  /**
   * step 1 — what the user TYPED under the diagram, or null.
   *
   * ⚠️ IT WAS MISSING FROM THIS RECAP UNTIL 8 Sep 2026, AND NOT BECAUSE THE
   * SCREEN FORGOT IT. The description lived in a localStorage key of step 1's
   * own, outside the answer store, so there was nothing here to read: the recap
   * showed the `Other` chip lit with no sign of the words that said what
   * "other" meant, which is the one part of that answer only the user can
   * supply. It is `answers.locationOther` now — see `lib/store/answers.ts`.
   *
   * Trimmed and nulled when empty, so whitespace does not open a block.
   */
  locationNote: string | null;
  /**
   * step 1 — the capture's id, or null. Never an image; see below.
   *
   * ⚠️ AN ID RATHER THAN A `boolean`, BECAUSE THE RECAP DRAWS THE PHOTOGRAPH.
   * `CheckInPhotoArt` keys its tone and composition off a seed, and this is the
   * only value in the store that changes when — and only when — the user
   * actually retakes the photo. Seeding on anything else would either repaint
   * the picture when an unrelated answer changed, or leave a retake with no
   * visible result at all. Read it for truthiness wherever only its existence
   * matters; `isEmpty` still does.
   */
  photo: string | null;
  /** step 3, with a ticked "Other" replaced by what was typed into it */
  conditions: string[];
  /** step 4 */
  timeline: ProfileTimeline | null;
};

/**
 * Read the store into the recap.
 *
 * ⚠️ AN ABSENT ANSWER IS AN ABSENT BLOCK, NOT AN EMPTY ONE. Step 3 is the
 * optional one and every step is reachable by deep link, so half of these can
 * legitimately be missing. A card reading "Known skin conditions —" tells the
 * user nothing and reads like a fault; the block simply does not appear, which
 * is why these are plain empty arrays rather than placeholders.
 *
 * `today` is passed in rather than read from the clock — `new Date()` during
 * render bakes the prerender's date into the HTML and then hydrates a mismatch
 * against the reader's own. See `lib/useToday.ts`, which is where the screen
 * gets it.
 */
export function recap(a: Answers, today: Date): ProfileRecap {
  /* every place step 1 marked, across its symptoms — the union this screen has
     always drawn, derived now that each symptom keeps its own places (`start`,
     see lib/store/answers.ts) */
  const locations = areasOf(a);

  return {
    skinType: a["skin-type"] ?? null,
    tendencies: a.tendencies ?? [],
    symptoms: symptomsOf(a),
    faceRegions: locations.filter((l) => FACE_REGION_IDS.includes(l)),
    otherLocations: locations.filter((l) => !FACE_REGION_IDS.includes(l)),
    places: a.start ?? {},
    locationNote: a.locationOther?.trim() || null,
    /* ⚠️ THE PHOTO IS AN ID, NEVER AN IMAGE. `selfie` holds a per-capture
       string and no pixels — every capture surface in LUX is a placeholder —
       so the recap draws `CheckInPhotoArt` seeded on it, the same illustration
       a PROGRESS check-in record shows for the same reason. What it must never
       do is draw an empty frame and call it the user's face. */
    photo: a.selfie ?? null,
    conditions: conditionsList(a),
    timeline: timelineFrom(a, today),
  };
}


/**
 * Step 3's answer, with a ticked "Other" replaced by what was typed into it.
 *
 * ⚠️ THE WORD "Other" MUST NOT SURVIVE INTO THE RECAP. `otherIsFilled` in
 * `flow.ts` already refuses to let the step complete with "Other" ticked and
 * the field empty, so by the time anyone reaches this screen the text exists —
 * and echoing the literal token back instead of the user's own sentence is the
 * screen failing to read what it was given.
 */
export function conditionsList(a: Answers): string[] {
  const selected = a.conditions ?? [];
  const other = a.conditionsOther?.trim();
  return selected.map((c) => (c === "Other" && other ? other : c));
}

function timelineFrom(a: Answers, today: Date): ProfileTimeline | null {
  const date = a.timing?.date ? fromIso(a.timing.date) : null;
  const status = a.timing?.status ?? null;
  if (!date && !status) return null;

  return {
    started: date ? formatLong(date) : COPY.startedUnknown,
    day: date ? dayLabel(daysBetween(date, today)) : null,
    status,
  };
}

/** "Day 16" — see `ProfileTimeline.day` for the counting. */
function dayLabel(days: number): string | null {
  if (days < 0) return null;
  return `${COPY.dayWord} ${days + 1}`;
}

/** Nothing has been collected — a deep link into the recap, or a store cleared
 *  by a refresh (flow answers are in memory only; see
 *  `lib/store/persistence.ts`). */
export function isEmpty(p: ProfileRecap): boolean {
  return (
    p.skinType === null &&
    p.tendencies.length === 0 &&
    p.symptoms.length === 0 &&
    p.faceRegions.length === 0 &&
    p.otherLocations.length === 0 &&
    p.locationNote === null &&
    !p.photo &&
    p.conditions.length === 0 &&
    p.timeline === null
  );
}

/* ---------------------------------------------------------------------------
   THE COPY

   ⚠️ IT LIVES HERE RATHER THAN IN THE SCREEN so the whole recap's user-facing
   vocabulary sits in one file — the same reason `analysis.ts` holds its
   sentences. Nothing here characterises a symptom, names a cause or promises an
   outcome; the recap's job is to read the user's answers back and hand off.

   ⚠️ THE LABELS NAME THEIR SUBJECT, WHICH IS WHY THEY ARE LONGER THAN THE
   QUESTIONS THEY CAME FROM — asked for directly, 7 Sep 2026. On step 4 the
   field labels are "Approximate start date" and "Current status", and they can
   be that short because the question above them ("When did this start?") is
   still on screen saying what "this" is. Lifted onto a recap that also carries
   a skin type, a symptom list and a conditions list, a bare "Started" leaves
   the reader to guess which of the four things on the page started, and
   "Current status" reads like the status of the investigation. So the recap
   spells out the subject every time: it is the SYMPTOMS that started, and it is
   the SYMPTOMS that are ongoing or improving now.

   ⚠️ AND THERE IS NO "From your answers" HEADING ANY MORE, for the same
   reason in reverse. It labelled a card holding six unrelated facts, which is
   the heading a block gets when nobody has decided what the block is. The card
   is now blocks that each say what they hold, and the whole screen is already
   titled — the generic heading was naming the page a second time.
   -------------------------------------------------------------------------- */

export const COPY = {
  /**
   * The page title — the `<h1>` and the `<title>`, which is why it is also
   * `lib/pageTitles.ts`'s entry for this route and has to stay in step with it.
   *
   * ⚠️ IT WAS "Skin profile" UNTIL 7 Sep 2026 — changed, asked for directly.
   * The screen is not the profile, it is what the investigation has been told
   * about the skin so far, and "About your skin" says the second. It also
   * settles an argument this file used to carry: the card's own
   * `YOUR SKIN PROFILE` overline was justified by the word "Your" doing enough
   * work to stop it repeating the page title. It no longer has to — the two
   * headings now say different things outright.
   */
  headlineLabel: "About your skin",
  /**
   * The sage card's own heading, rendered uppercase by `t-overline`.
   *
   * ⚠️ IT SAYS "Your", AND THE PAGE TITLE DOES NOT, WHICH IS THE WHOLE REASON
   * IT CAN BE HERE. The page is titled `About your skin`; `YOUR SKIN PROFILE`
   * names what is inside this card and claims it for the reader. Asked for
   * directly, 7 Sep 2026, after being left out of the first build of the card
   * on the grounds that it repeated the h1 24px above it — which was true of
   * the title the page had then and is not true of the one it has now.
   */
  cardLabel: "Your skin profile",
  /* ---- the blocks, in the order the screen draws them ---- */
  skinTypeLabel: "Skin type",
  skinTypeUnknown: "Not answered",
  tendenciesLabel: "Tendencies",
  /**
   * The episode block's heading — "Symptom state" over one symptom, "Symptoms
   * state" otherwise. ⚠️ IT WAS "What you noticed" UNTIL 13 Sep 2026, over the
   * symptom pills — renamed and the pills removed, asked for directly — and
   * the pills are callouts on the face diagram since 14 Sep 2026. The block
   * holds step 4 alone: the status as its value, then `Started on`. The status
   * needs no label of its own under a heading that already names it, which is
   * why `statusLabel` is gone.
   *
   * ⚠️ "Current state" UNTIL 14 Sep 2026 — renamed, asked for directly
   * ("Symptom(s) state"). It is the symptoms' state, not the investigation's,
   * which is the rule every label on this screen already follows (see the
   * copy note above), and the noun follows how many symptoms were reported.
   * `/progress`'s profile card takes the same label.
   */
  currentLabel: (symptoms: number) =>
    symptoms === 1 ? "Symptom state" : "Symptoms state",
  /* ---- the photo, step 1's optional capture ---- */
  /**
   * ⚠️ IT IS A BLOCK OF ITS OWN NOW, AND IT WAS A LINE OF TEXT TWICE BEFORE
   * — asked for directly, 7 Sep 2026. "Photo added" sat first under the symptom
   * pills and then on the face card, and both said the same thing: that a
   * capture exists. A recap of a photograph should BE the photograph.
   */
  photoLabel: "Photo",
  /** the figure's accessible name — the well holds a drawing, not a face */
  photoCaption: "The photo you added",
  photoUpdate: "Update photo",
  /**
   * The face card's heading, on this screen and on `/progress`.
   *
   * ⚠️ "Where you noticed it" UNTIL 14 Sep 2026 — renamed, asked for directly.
   * Since the same day the face carries each symptom as a callout pill with a
   * line to its places, so the card holds WHAT as well as WHERE, and a heading
   * naming only the places undersold it.
   */
  locationLabel: "Symptoms and location",
  /**
   * The label over step 1's typed description.
   *
   * ⚠️ IT NAMES THE CHIP IT EXPLAINS, the same way every other label on this
   * screen names its subject. The value is a sentence the user wrote, sitting
   * under a diagram of pills nobody wrote — without "Other" on it, a line of
   * free text under a face reads as a caption for the face rather than as the
   * answer the `Other` chip stands in for.
   *
   * ⚠️ SHORTENED FROM "Other, in your words" TO "Other" — asked for directly,
   * 9 Sep 2026. The label-over-value pair already reads as one unit (see
   * `.metaLabel`/`.metaValue` in SkinProfileSummary.module.css); "in your
   * words" was explaining the pair rather than naming it.
   */
  locationOtherLabel: "Other",
  /* ⚠️ `locationSpoken` — "On the face: …", the diagram's regions in words —
     WENT ON 14 Sep 2026 with the callouts: `FaceDiagram` lists each symptom
     with its places for a screen reader now, and those places are the regions,
     so the two said one answer twice. */
  /** ⚠️ "Known skin conditions" until 13 Sep 2026 — shortened, asked for
   *  directly; `/progress`'s profile card carries the same label. */
  conditionsLabel: "Known conditions",
  /**
   * The SYMPTOMS block's first meta pair — `Started on` over
   * "Aug 31, 2026 · Day 8".
   *
   * ⚠️ IT SITS WITH THE EPISODE, NOT WITH THE SKIN TYPE — asked for directly,
   * 7 Sep 2026. A date on its own is a date; under the current state it is the
   * age of that state, which is the only thing the reading is for. (It sat
   * under the symptom pills until 13 Sep 2026, when they left this block.)
   *
   * ⚠️ IT IS A LABEL NOW, NOT THE FIRST WORD OF A SENTENCE — asked for
   * directly, 8 Sep 2026, when both meta lines took the sage card's
   * label-over-value shape. "Started Aug 31" ran the label into the value and
   * only worked because the verb happened to govern the date; a label sitting
   * on its own line has to name the field, so it gains the preposition the
   * running sentence carried implicitly.
   */
  startedLabel: "Started on",
  dayWord: "Day",
  /* ---- step 4, the whole of the symptoms' state block ---- */
  startedUnknown: "No start date given",
  /* ---- the hand-off ---- */
  cta: "Add your products",
  /**
   * ⚠️ SAYS WHY, NOT JUST WHAT. The products list is where the investigation
   * gets the thing it cannot derive — what you actually put on your skin, and
   * when you started it. A bare "Add products" button at the end of a recap
   * reads as an unrelated errand — and the label says "your" for the same
   * reason the card's overline does: the recap is the user's own answers, and
   * the products it hands off to are the ones they actually use.
   */
  ctaHelp:
    "Next, add the products you use so the investigation has something to compare against.",
  /* ---- the empty state ---- */
  emptyTitle: "Nothing recorded yet",
  emptyBody:
    "Answer the investigation questions and your skin profile will be summarised here.",
  emptyCta: "Start the investigation",
} as const;
