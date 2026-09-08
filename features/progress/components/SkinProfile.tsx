import styles from "./SkinProfile.module.css";
import { DataCard } from "@/components/ui/DataCard";
import type { CurrentState } from "../progress";

/**
 * `card · your skin profile` — Figma 552:1241 (mobile) / 554:1399 (desktop).
 *
 * A recap of what the investigation already knows, in Surface System B. Per the
 * handoff it also appears on `Check — start` and `Check — add products`, which
 * is why it is its own component rather than markup inside `ProgressScreen`.
 *
 * ⚠️ IT ECHOES, IT DOES NOT HARDCODE. The comp reads "Combination / Sensitive /
 * Current: Redness, Itching on Cheeks" because a comp has to show a filled-in
 * state; every one of those is an answer the user gave on steps 1 and 2. Each
 * is optional, because /progress is reachable from the nav on a deep link with
 * an empty store — a missing answer drops its row rather than rendering an
 * empty one.
 *
 * ⚠️ EVERY ANSWER ON THIS CARD IS A LABEL OVER A VALUE, AS OF 8 Sep 2026 — the
 * current state was the exception and it looked like one. It ran as a single
 * `t-body3` line, `Current: Redness on Whole face, …`, wearing its label inline
 * as a colon prefix while the two pairs above it put a muted `t-label-sm` label
 * over a `t-h6` value. It now takes that same shape: `Current state` over the
 * symptoms and places, at the size `Not sure` and `Sensitive` are drawn at.
 * The label comes from `formatCurrent`, not from here, because locations
 * without symptoms are `Affected areas` instead. ⚠️ The `Started …` meta stays
 * a `t-label-sm` line under the value and is NOT a third pair — it is the age
 * of the state above it, not another answer.
 */
export function SkinProfile({
  skinType,
  tendencies,
  current,
  started,
  className,
}: {
  skinType?: string;
  /** step 2's tendencies — multi-select, so it can be more than the comp's one */
  tendencies?: string[];
  /** `Current state` over "Redness, Itching on Cheeks" */
  current?: CurrentState | null;
  /** "Started Aug 2, 2026 · Day 12" */
  started?: string | null;
  className?: string;
}) {
  const tendency = tendencies?.length ? tendencies.join(", ") : undefined;
  const hasPair = Boolean(skinType || tendency);
  const hasDetails = Boolean(current || started);

  return (
    <DataCard className={className} aria-labelledby="skin-profile-title">
      {/* Overline in text/on-data-muted — the handoff's rule for every section
          label on a data card. */}
      <h2 id="skin-profile-title" className={`${styles.label} t-overline`}>
        Your skin profile
      </h2>

      {hasPair && (
        <dl className={styles.pairs}>
          {skinType && <Pair label="Skin type" value={skinType} />}
          {/* the second pair is right-aligned, which is what puts the two at
              the ends of the card rather than next to each other */}
          {tendency && <Pair label="Tendency" value={tendency} align="end" />}
        </dl>
      )}

      {/* ⚠️ A DIVIDER ON A DATA CARD IS 1px border/glass, NOT border/subtle.
          Only drawn when there is something on both sides of it. */}
      {hasPair && hasDetails && <div className={styles.divider} />}

      {hasDetails && (
        <div className={styles.details}>
          {current && (
            /* Its own <dl> rather than a row in the one above: that list is a
               flex ROW pushing its two pairs to the card's edges, and this pair
               is full-width under the divider. A <p> cannot live inside a <dl>,
               which is why the meta line sits outside it. */
            <dl className={styles.currentPair}>
              <Pair label={current.label} value={current.value} />
            </dl>
          )}
          {started && <p className={`${styles.started} t-label-sm`}>{started}</p>}
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
  align?: "end";
}) {
  return (
    <div className={styles.pair} data-align={align}>
      <dt className={`${styles.pairLabel} t-label-sm`}>{label}</dt>
      <dd className={`${styles.pairValue} t-h6`}>{value}</dd>
    </div>
  );
}
