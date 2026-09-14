import type { ReactNode } from "react";
import styles from "./SkinProfile.module.css";
import { DataCard } from "@/components/ui/DataCard";
import { COPY } from "@/features/my-skin/profile";

/**
 * `card · your skin profile` — Figma 552:1241 (mobile) / 554:1399 (desktop).
 *
 * A recap of what the investigation already knows, in Surface System B. Per the
 * handoff it also appears on `Check — start` and `Check — add products`, which
 * is why it is its own component rather than markup inside `ProgressScreen`.
 *
 * ⚠️ IT ECHOES, IT DOES NOT HARDCODE. The comp reads "Combination / Sensitive /
 * Current: Redness, Itching on Cheeks" because a comp has to show a filled-in
 * state; every one of those is an answer the user gave. Each is optional,
 * because /progress is reachable from the nav on a deep link with an empty
 * store — a missing answer drops its row rather than rendering an empty one.
 *
 * ⚠️ EVERY ANSWER ON THIS CARD IS A LABEL OVER A VALUE, AS OF 8 Sep 2026. The
 * current state used to run as one `t-body3` line, `Current: Redness on Whole
 * face, …`, wearing its label inline while the pairs above it put a muted
 * `t-label-sm` label over a `t-h6` value. ⚠️ The `Started …` meta is a
 * `t-label-sm` line under the state and NOT another pair — it is the age of the
 * state above it, not another answer.
 *
 * ⚠️ THE SYMPTOMS' STATE IS STEP 4's STATUS, AND THE SYMPTOM PILLS ARE GONE —
 * 14 Sep 2026, asked for directly ("current state would be ongoing, remove the
 * breakout pill"). NOT IN FIGMA. From 13 Sep 2026 the pair held step 1's
 * symptoms as rose pills, first over a locations line and then alone once the
 * face card joined the screen. Both halves of that answer are on the face card
 * now, as callouts — each symptom a pill at the edge with a line to each of its
 * places — so this card says where the episode has got to instead: `Ongoing`,
 * `Improving`, … The label is the profile recap's own `COPY.currentLabel`, the
 * heading of its block that holds the same answer: `Symptom state` over one
 * symptom and `Symptoms state` otherwise (renamed from `Current state` the same
 * day, asked for directly), which is why the card is told how many symptoms
 * there are. The demo's value is `DEMO_PROFILE.status`.
 *
 * ⚠️ THE LATEST PHOTOS SIT BESIDE IT — NOT IN FIGMA, 14 Sep 2026, asked for
 * directly. They arrive as a slot (`photos`) rather than as data, because the
 * strip opens a gallery sheet that belongs to the screen, not to the card. The
 * row pushes the two to the card's edges, the way the pairs above it sit.
 */
export function SkinProfile({
  skinType,
  tendencies,
  conditions,
  status,
  symptomCount = 0,
  started,
  photos,
  className,
}: {
  skinType?: string;
  /** step 2's tendencies — multi-select, so it can be more than the comp's one */
  tendencies?: string[];
  /** step 3's answer — a third column when there is one */
  conditions?: string[];
  /** step 4's status — `Symptoms state` over "Ongoing" */
  status?: string | null;
  /** how many symptoms step 1 reported, which picks the label's noun */
  symptomCount?: number;
  /** "Started Aug 2, 2026 · Day 12" */
  started?: string | null;
  /** drawn beside the symptoms' state — `LatestPhotos` on `/progress` */
  photos?: ReactNode;
  className?: string;
}) {
  const tendency = tendencies?.length ? tendencies.join(", ") : undefined;
  const known = conditions?.length ? conditions.join(", ") : undefined;
  const pairCount = [skinType, tendency, known].filter(Boolean).length;
  const hasPair = pairCount > 0;
  const hasState = Boolean(status || started);
  const hasDetails = hasState || Boolean(photos);

  return (
    <DataCard className={className} aria-labelledby="skin-profile-title">
      {/* Overline in text/on-data-muted — the handoff's rule for every section
          label on a data card. */}
      <h2 id="skin-profile-title" className={`${styles.label} t-overline`}>
        Your skin profile
      </h2>

      {hasPair && (
        <dl className={styles.pairs} data-count={pairCount}>
          {skinType && <Pair label="Skin type" value={skinType} />}
          {/* the last pair is right-aligned, which is what puts the pairs at
              the ends of the card rather than next to each other.

              ⚠️ NOT IN FIGMA — with known conditions the card takes a THIRD
              column, and tendency moves to the middle, asked for directly
              13 Sep 2026. The label is the recap's own `COPY`, so the two
              screens cannot name step 3 differently. */}
          {tendency && (
            <Pair
              label="Tendency"
              value={tendency}
              align={known ? "center" : "end"}
            />
          )}
          {known && (
            <Pair label={COPY.conditionsLabel} value={known} align="end" />
          )}
        </dl>
      )}

      {/* ⚠️ A DIVIDER ON A DATA CARD IS 1px border/glass, NOT border/subtle.
          Only drawn when there is something on both sides of it. */}
      {hasPair && hasDetails && <div className={styles.divider} />}

      {hasDetails && (
        <div className={styles.details}>
          {hasState && (
            <div className={styles.state}>
              {status && (
                /* its own <dl> rather than a row in the one above: that list
                   spreads its pairs across the card, and this one shares its
                   row with the photos. A <p> cannot live inside a <dl>, which
                   is why the meta line sits outside it. */
                <dl className={styles.currentPair}>
                  <Pair label={COPY.currentLabel(symptomCount)} value={status} />
                </dl>
              )}
              {started && (
                <p className={`${styles.started} t-label-sm`}>{started}</p>
              )}
            </div>
          )}
          {photos}
        </div>
      )}
    </DataCard>
  );
}

function Pair({
  label,
  value,
  align,
}: {
  label: string;
  value: string;
  align?: "center" | "end";
}) {
  return (
    <div className={styles.pair} data-align={align}>
      <dt className={`${styles.pairLabel} t-label-sm`}>{label}</dt>
      <dd className={`${styles.pairValue} t-h6`}>{value}</dd>
    </div>
  );
}
