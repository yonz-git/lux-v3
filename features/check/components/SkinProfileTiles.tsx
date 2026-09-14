import { useId } from "react";
import styles from "./SkinProfileTiles.module.css";

/**
 * ⚠️ NOT IN FIGMA — the skin profile as four tiles, under the skin-profile
 * strip on `/check`, asked for directly 14 Sep 2026. No frame draws it.
 *
 * ⚠️ IT WAS `PlanCard` FOR ONE DAY AND KEPT ONLY ITS GLASS. The same slot held
 * a card built from a supplied reference — a four-point star, "Monthly" and a
 * line of plan copy — in the strip's exact box. Its contents were replaced,
 * asked for directly: the strip's own `Your skin profile` overline at the
 * top-left, then `Skin type`, `Tendencies` and `Known conditions` — and, added
 * later the same day, `Symptoms state` — each in a tile of its own. The strip
 * above is deliberately untouched ("leave the profile box for now"), so the
 * two are a side-by-side trial of one readout, not a pair.
 *
 * ⚠️ THE HEIGHT IS ITS CONTENT NOW, NOT THE STRIP'S. The equal-rows rule that
 * held the plan card at 112 is gone from `CheckScreen.module.css`: boxed pairs
 * under an overline do not fit 112, "add more height if needed" was the ask,
 * and equal rows would have grown the untouched strip along with it.
 *
 * ⚠️ DEEP TEAL GLASS, WHITE INK, ANSWERS AS PILLS — all tuned by hand in the
 * browser or asked for directly, 14 Sep 2026; every value and its history is
 * in the module. The card is `#005461` at 71% under the plan card's glows,
 * desaturated frost, lit edge ring and grain, 1.4rem a side, the column's
 * width at every breakpoint (it was 140% on desktop for a while). A left-lit
 * white rule fades out under the overline. Four tiles, two a row at every
 * width, 6 apart; each tile is only spacing now — label over answer,
 * left-aligned — and each answer is a filled frosted teal pill.
 * ⚠️ WHITE DOES NOT CLEAR AA EVERYWHERE: 4.27–5.27:1 for the overline and
 * labels on the card, and 4.16–4.29:1 for the answers on their lighter
 * pills, against 4.5:1. The measurements are in the module.
 *
 * ⚠️ THE VALUES ARE THE CALLER'S, AND ON `/check` THEY ARE LITERALS — `Dry`,
 * `Acne-prone`, `None`, as supplied. That breaks the "screens echo answers"
 * rule on purpose, for a trial, and it means this card and the strip above
 * currently disagree about the demo skin type. Wire them to `skinProfile()`
 * (and step 3's conditions) before this outlives the trial.
 *
 * ⚠️ THE STATE TILE CARRIES ITS START DATE — asked for directly 14 Sep 2026,
 * after `/progress`'s profile card (which held `Started <date> · Day <n>`)
 * became the gallery. It is a line under the pill, not a fifth tile, because
 * a date is only the age of something when it sits under the something — the
 * recap's rule. Optional: `/progress` passes it. The date and the day are
 * each kept whole, so a narrow tile breaks at the `·` and never inside a date.
 *
 * A `dl`: each tile is one term and its value, grouped in a `div` so a tile is
 * one box. The start date is a second `dd` under the same term.
 */
export function SkinProfileTiles({
  skinType,
  tendencies,
  conditions,
  symptomsState,
  symptomsStarted,
  className,
}: {
  skinType: string;
  tendencies: string;
  conditions: string;
  /** where the current episode stands — step 4's status */
  symptomsState: string;
  /** when the episode started — `{ date: "Aug 31, 2026", day: 15 }` */
  symptomsStarted?: { date: string; day: number };
  className?: string;
}) {
  const titleId = useId();
  const tiles = [
    { label: "Skin type", value: skinType },
    { label: "Tendencies", value: tendencies },
    { label: "Known conditions", value: conditions },
    { label: "Symptoms state", value: symptomsState, started: symptomsStarted },
  ];

  return (
    <section
      className={[styles.card, className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className={`${styles.overline} t-overline`}>
        Your skin profile
      </h2>
      <dl className={styles.tiles}>
        {tiles.map(({ label, value, started }) => (
          <div key={label} className={styles.tile}>
            <dt className={`${styles.tileLabel} t-body3`}>{label}</dt>
            <dd className={`${styles.tileValue} t-body3`}>{value}</dd>
            {started && (
              <dd className={`${styles.tileMeta} t-label-sm`}>
                <span className={styles.nowrap}>Started {started.date}</span>
                {" · "}
                <span className={styles.nowrap}>Day {started.day}</span>
              </dd>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}
