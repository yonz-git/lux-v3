/**
 * The skin profile RECAP — everything steps 1–4 collected, read back as one
 * screen. `/investigation/profile`, between Timing and Products.
 */
import { areasOf, symptomsOf, type Answers } from "@/lib/store/answers";
import { FACE_REGION_IDS } from "@/features/my-skin/components/FaceDiagram";
import { daysBetween, formatLong, fromIso } from "@/lib/date";

/** When it started, and where it has got to since. */
export type ProfileTimeline = {
  /** step 4's date, written out */
  started: string;
  /** The span counted forwards from it — "Day 16". */
  day: string | null;
  /** the same span as a bare number (16), null exactly when `day` is — for
      `SkinProfileTiles`, which writes its own "Day" */
  dayNumber: number | null;
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
   */
  places: NonNullable<Answers["start"]>;
  /** step 1 — what the user TYPED under the diagram, or null. */
  locationNote: string | null;
  /** step 1 — the capture's id, or null. Never an image; see below. */
  photo: string | null;
  /** step 3, with a ticked "Other" replaced by what was typed into it */
  conditions: string[];
  /** step 4 */
  timeline: ProfileTimeline | null;
};

/** Read the store into the recap. */
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
    photo: a.selfie ?? null,
    conditions: conditionsList(a),
    timeline: timelineFrom(a, today),
  };
}

/** Step 3's answer, with a ticked "Other" replaced by what was typed into it. */
export function conditionsList(a: Answers): string[] {
  const selected = a.conditions ?? [];
  const other = a.conditionsOther?.trim();
  return selected.map((c) => (c === "Other" && other ? other : c));
}

function timelineFrom(a: Answers, today: Date): ProfileTimeline | null {
  const date = a.timing?.date ? fromIso(a.timing.date) : null;
  const status = a.timing?.status ?? null;
  if (!date && !status) return null;

  const days = date ? daysBetween(date, today) : null;
  return {
    started: date ? formatLong(date) : COPY.startedUnknown,
    day: days === null ? null : dayLabel(days),
    dayNumber: days === null || days < 0 ? null : days + 1,
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

/* THE COPY */

export const COPY = {
  /**
   * The page title — the `<h1>` and the `<title>`, which is why it is also
   * `lib/pageTitles.ts`'s entry for this route and has to stay in step with it.
   */
  headlineLabel: "What we know about your skin",
  /** The sage card's own heading, rendered uppercase by `t-overline`. */
  cardLabel: "Your skin profile",
  /* ---- the blocks, in the order the screen draws them ---- */
  skinTypeLabel: "Skin type",
  skinTypeUnknown: "Not answered",
  tendenciesLabel: "Tendencies",
  /**
   * The episode block's heading — "Symptom state" over one symptom, "Symptoms
   * state" otherwise.
   */
  currentLabel: (symptoms: number) =>
    symptoms === 1 ? "Symptom state" : "Symptoms state",
  /* ---- the photo, step 1's optional capture ---- */
  photoLabel: "Photo",
  /** the figure's accessible name — the well holds a drawing, not a face */
  photoCaption: "The photo you added",
  photoUpdate: "Update photo",
  /** The face card's heading, on this screen and on `/myskin`. */
  locationLabel: "Symptoms and location",
  /** The label over step 1's typed description. */
  locationOtherLabel: "Other",
  legendLabel: "Symptoms by place",
  legendEmpty: "No symptoms placed yet.",
  conditionsLabel: "Known conditions",
  /**
   * The SYMPTOMS block's first meta pair — `Started on` over
   * "Aug 31, 2026 · Day 8".
   */
  startedLabel: "Started on",
  dayWord: "Day",
  /* ---- step 4, the whole of the symptoms' state block ---- */
  startedUnknown: "No start date given",
  /* ---- the hand-off ---- */
  cta: "Add your products",
  startOver: "Start over",
  startOverTitle: "Start over?",
  startOverBody:
    "This clears your skin profile, products, analyses and check-ins from this browser.",
  startOverConfirm: "Clear and start over",
  ctaHelp:
    "Next, add the products you use so the investigation has something to compare against.",
  /* ---- the empty state ---- */
  emptyTitle: "Nothing recorded yet",
  emptyBody:
    "Answer the investigation questions and your skin profile will be summarised here.",
  emptyCta: "Start the investigation",
} as const;
