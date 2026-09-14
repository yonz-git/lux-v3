import { useId } from "react";
import styles from "./SkinProfileTiles.module.css";

/**
 * ⚠️ NOT IN FIGMA — the skin profile as three tiles, under the skin-profile
 * strip on `/check`, asked for directly 14 Sep 2026. No frame draws it.
 *
 * ⚠️ IT WAS `PlanCard` FOR ONE DAY AND KEPT ONLY ITS GLASS. The same slot held
 * a card built from a supplied reference — a four-point star, "Monthly" and a
 * line of plan copy — in the strip's exact box. Its contents were replaced,
 * asked for directly: the strip's own `Your skin profile` overline at the
 * top-left, then `Skin type`, `Tendencies` and `Known conditions` each in a box
 * of its own, the three in one row. The strip above is deliberately untouched
 * ("leave the profile box for now"), so the two are a side-by-side trial of one
 * readout, not a pair.
 *
 * ⚠️ THE HEIGHT IS ITS CONTENT NOW, NOT THE STRIP'S. The equal-rows rule that
 * held the plan card at 112 is gone from `CheckScreen.module.css`: three boxed
 * pairs under an overline do not fit 112, "add more height if needed" was the
 * ask, and equal rows would have grown the untouched strip along with it.
 *
 * ⚠️ DEEP TEAL GLASS, WHITE INK, SUNKEN TILES — all tuned by hand in the
 * browser and supplied, 14 Sep 2026. The card is `#005461` at 71% under the
 * plan card's glows, desaturated frost, lit edge ring and grain, with white
 * text (4.27–5.27:1 on the card, 4.80:1 or better inside a tile; the numbers
 * are in the module). It takes the column's width, the strip's edges, at every
 * breakpoint — it was 140% of the column on desktop for a while, centred over
 * the strip, and came back to 100%, asked for directly. Each tile is 7% black with a light inner shadow, radius 20, its label
 * and value centred. ⚠️ FOUR TILES, TWO A ROW AT EVERY WIDTH — `Symptoms
 * state` was added the same day, asked for directly, with the grid. Three in a
 * row was too narrow on mobile (72 a tile at 320), and stacking them pushed
 * `Start analysis` below the fold at 440. ⚠️ Each tile is the strip's pair —
 * label over value, left-aligned — at every width, with no inner shadow; the
 * centred text, the desktop one-line form and the shadow all came off, asked
 * for directly. The tiles' backdrop blur came off in the tuning — it
 * could never show, since the card's own `backdrop-filter` makes it the
 * backdrop root.
 *
 * ⚠️ THE VALUES ARE THE CALLER'S, AND ON `/check` THEY ARE LITERALS — `Dry`,
 * `Acne-prone`, `None`, as supplied. That breaks the "screens echo answers"
 * rule on purpose, for a trial, and it means this card and the strip above
 * currently disagree about the demo skin type. Wire them to `skinProfile()`
 * (and step 3's conditions) before this outlives the trial.
 *
 * A `dl`: each tile is one term and its value, grouped in a `div` so a tile is
 * one box.
 */
export function SkinProfileTiles({
  skinType,
  tendencies,
  conditions,
  symptomsState,
  className,
}: {
  skinType: string;
  tendencies: string;
  conditions: string;
  /** where the current episode stands — step 4's status */
  symptomsState: string;
  className?: string;
}) {
  const titleId = useId();
  const tiles = [
    { label: "Skin type", value: skinType },
    { label: "Tendencies", value: tendencies },
    { label: "Known conditions", value: conditions },
    { label: "Symptoms state", value: symptomsState },
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
        {tiles.map(({ label, value }) => (
          <div key={label} className={styles.tile}>
            <dt className={`${styles.tileLabel} t-body3`}>{label}</dt>
            <dd className={`${styles.tileValue} t-body2`}>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
