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
 * ⚠️ BARE CARD, DARK INK, ANSWERS AS PILLS — all tuned by hand in the
 * browser or asked for directly, 14 Sep 2026; every value and its history is
 * in the module. It was deep teal glass with white ink until later that day;
 * the fill and the frost were switched off in DevTools and the ink went to the
 * global `text/primary`. What is left is the card's shadows, lit edge ring and
 * grain, 1.4rem a side, at the column's width at every breakpoint. An 18px
 * overline sits over a left-anchored rule in its own ink. Four tiles, two a
 * row at every width, 6 apart; each tile is only spacing — label over answer,
 * left-aligned — and each answer is an OUTLINED indigo pill.
 * ⚠️ THE PILL WAS SOLID `bg/brand` WITH WHITE INK UNTIL 24 Sep 2026, when it
 * was asked for outlined: filled, it wore the primary button's own indigo, so
 * a read-only answer on `/progress` read as tappable beside `Check in today`.
 * Solid indigo is for actions and for `Chip`'s selected state; a readout gets
 * the ring — and, since 25 Sep, the face pill's deep core rather than any
 * indigo at all (see the module). It fixed the contrast too — the white pill measured 4.13–4.29:1
 * against the 4.5:1 that 14px needs, and the ink now measures 8.08:1 or
 * better. See the module.
 *
 * ⚠️ THE VALUES ARE THE CALLER'S, AND ON `/check` THEY ARE LITERALS — `Dry`,
 * `Acne-prone`, `None`, as supplied. That breaks the "screens echo answers"
 * rule on purpose, for a trial, and it means this card and the strip above
 * currently disagree about the demo skin type. Wire them to `skinProfile()`
 * (and step 3's conditions) before this outlives the trial.
 *
 * ⚠️ NO START DATE, ON ANY SCREEN — 15 Sep 2026, asked for directly. The
 * state tile carried `Started <date> · Day <n>` from 14 Sep; `/progress` and
 * the recap dropped it first, then `/check/new` and `/check/results`, and the
 * prop went with it so no caller can bring it back on one screen alone.
 *
 * ⚠️ ONE CARD, FOUR SCREENS, ONE LOOK — asked for directly 15 Sep 2026 ("when
 * I fix one it is automatically fixed on others"). Callers hand over the RAW
 * answers; the `None` for an empty set and the `Not set` for a missing answer
 * live here. Do not add a prop that lets one screen draw this card
 * differently — change the card.
 *
 * ⚠️ ONE PILL PER ANSWER, NOT ONE PILL OF COMMAS — 16 Sep 2026, asked for
 * directly ("2 conditions should be 2 pills"). Tendencies and conditions were
 * joined into a single pill, so `Rosacea, Psoriasis` wrapped inside one
 * indigo shape and read as one condition with a long name. A multi-select is a
 * SET (AGENTS.md), and each member is its own pill now, wrapping as a row.
 *
 * A `dl`: each tile is one term and its values, grouped in a `div` so a tile is
 * one box. ⚠️ A SET IS SEVERAL `dd`s UNDER ONE `dt` — the HTML form for a name
 * with more than one value — rather than a list nested in one `dd`.
 */
const NOT_SET = "Not set";
const NONE = "None";

/** a set's members, or `None` in the one pill an empty set gets */
const members = (list?: readonly string[] | null) =>
  list && list.length > 0 ? list : [NONE];

export function SkinProfileTiles({
  skinType,
  tendencies,
  conditions,
  symptomsState,
  className,
}: {
  skinType?: string | null;
  tendencies?: readonly string[] | null;
  conditions?: readonly string[] | null;
  /** where the current episode stands — step 4's status */
  symptomsState?: string | null;
  className?: string;
}) {
  const titleId = useId();
  const tiles = [
    { label: "Skin type", values: [skinType || NOT_SET] },
    { label: "Tendencies", values: members(tendencies) },
    { label: "Known conditions", values: members(conditions) },
    { label: "Symptoms state", values: [symptomsState || NOT_SET] },
  ];

  return (
    <section
      /* `canvas-card` (globals.css) is the bare-canvas surface — the shadows,
         edge ring and grain this card's own module used to carry */
      className={[styles.card, "canvas-card", className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className={`${styles.overline} t-overline`}>
        Your skin profile
      </h2>
      <dl className={styles.tiles}>
        {tiles.map(({ label, values }) => (
          <div key={label} className={styles.tile}>
            <dt className={`${styles.tileLabel} t-body3`}>{label}</dt>
            {values.map((value) => (
              <dd key={value} className={`${styles.tileValue} t-body3`}>
                {value}
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </section>
  );
}
