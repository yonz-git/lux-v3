import type { Answers } from "@/lib/store/answers";
import type { CheckIn } from "./progress";
import { addDays, toIso } from "@/lib/date";

/** The last week's check-ins, oldest first: a flare settling from severe to mild. */
const WEEK: Omit<CheckIn, "date">[] = [
  { severity: 7, direction: "worse", changes: ["More redness"], note: "Cheeks hot after cleansing." },
  { severity: 6, direction: "better", changes: ["Less redness"] },
  { severity: 6, direction: "same", changes: ["No change"] },
  { severity: 5, direction: "better", changes: ["Less redness", "Less dryness"], note: "Paused the new serum." },
  { severity: 4, direction: "better", changes: ["Less dryness"] },
  { severity: 4, direction: "same", changes: ["No change"] },
  { severity: 3, direction: "better", changes: ["Less redness", "Less breakouts"], note: "Calmest my skin has felt in weeks." },
];

/**
 * A filled-in skin profile for `/myskin/case-study`, dated from `today`: the
 * investigation began three weeks ago, and every day of the last week has a
 * check-in with a photo.
 */
export function caseStudyAnswers(today: Date): Answers {
  const first = addDays(today, -(WEEK.length - 1));
  return {
    start: {
      Redness: ["Cheeks (L)", "Cheeks (R)"],
      Dryness: ["Cheeks (L)", "Cheeks (R)", "Chin / jaw"],
      Breakouts: ["Chin / jaw"],
    },
    "skin-type": "Balanced",
    tendencies: ["Sensitive"],
    conditions: ["Rosacea"],
    timing: { status: "Ongoing", date: toIso(addDays(today, -21)) },
    checkIns: WEEK.map((c, i) => {
      const date = toIso(addDays(first, i));
      return { ...c, date, photo: `case-study-${date}` };
    }),
  };
}
