"use client";

import { type CSSProperties, useState } from "react";
import styles from "./CompatCard.module.css";
import { Sheet } from "@/components/ui/Sheet";
import { Tag } from "@/components/ui/Tag";
import { CountUp } from "@/components/ui/CountUp";
import { CloseIcon } from "@/components/ui/icons";
import { BAND_LABEL, type CheckAnalysis } from "@/features/check/check";
import { type CatalogProduct, fullName } from "@/features/products/products";

/**
 * One product's score on `Check results` — SCORES B, lux-v3 (1 Oct 2026), picked
 * on the design canvas ("Scores B — Rings"). The results lay these out two to a
 * row: a 64 ring drawn to the score in its band's colour with the number in
 * the middle, the product's name over its brand, and a pill naming the band.
 *
 * ⚠️ THE BAND IS NAMED IN WORDS ON EVERY CARD. `feedback/warning` and
 * `feedback/error` share a hue and differ only in lightness, so "Risky" and
 * "Avoid" are NOT distinguishable by colour — the pill's word is what separates
 * them, and the ring and dot only repeat it. Compatible gets a pill too now: in
 * a grid, the one card without a pill reads as missing one.
 *
 * ⚠️ THE DETAIL OPENS IN A SHEET. It was an accordion row, which a grid cannot
 * host — a card opening inside a two-column row pushes its neighbour down and
 * leaves a hole beside itself. The whole card is the button; the bar, the
 * ingredients that cost the score and the recommendation open over the screen
 * in the app's one overlay, `Sheet`, and close back onto the grid. The board
 * drew the card, not what tapping it does; this is decided here.
 *
 * ⚠️ `onRemove` IS THE EDIT MODE'S GLYPH — passed only while the results box is
 * editing (see `CheckResults`), so the resting grid has no destructive
 * control on it. It is a SIBLING of the card's button, not a child: a
 * `<button>` may not contain another.
 */
export function CompatCard({
  analysis,
  onRemove,
  index = 0,
}: {
  analysis: CheckAnalysis;
  /** the card's place in the grid — orders its entrance (module, end) */
  index?: number;
  /** absent = the card cannot be removed, which is every read-only caller */
  onRemove?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { product, score, band } = analysis;
  const name = fullName(product);

  return (
    <div
      className={styles.card}
      data-band={band}
      style={{ "--i": index } as CSSProperties}
    >
      <button
        type="button"
        className={`${styles.open} pressable`}
        aria-haspopup="dialog"
        aria-label={`${name}, ${score}% compatible, ${BAND_LABEL[band]}. Show details`}
        onClick={() => setOpen(true)}
      >
        <ScoreRing score={score} countDelay={200 + index * 90} />
        <Names product={product} />
        <span className={`${styles.band} t-label-sm`}>
          <span className={styles.bandDot} aria-hidden="true" />
          {BAND_LABEL[band]}
        </span>
      </button>

      {onRemove && <RemoveButton name={name} onRemove={onRemove} />}

      <Sheet open={open} onClose={() => setOpen(false)} title={name}>
        <CompatDetail analysis={analysis} />
      </Sheet>
    </div>
  );
}

/**
 * A product added since the check ran — the card's shape with nothing scored.
 *
 * ⚠️ NOT A BUTTON, AND NO ARC. There is no detail to open and no number to
 * draw, so the ring is its empty track and the pill slot holds the one true
 * thing available: it is in the set, and the scores beside it do not include
 * it. Neutral, deliberately not a band colour — "no result yet" is not a
 * fourth value on a three-value scale.
 */
export function PendingCompatCard({
  product,
  onRemove,
}: {
  product: CatalogProduct;
  onRemove?: () => void;
}) {
  return (
    <div className={`${styles.card} ${styles.pending}`}>
      <div className={styles.open}>
        <ScoreRing />
        <Names product={product} />
        <Tag>Not analysed yet</Tag>
      </div>

      {onRemove && <RemoveButton name={fullName(product)} onRemove={onRemove} />}
    </div>
  );
}

/* the ring: r 27, a 5 stroke, starting at 12 o'clock */
const R = 27;
const C = 2 * Math.PI * R;

function ScoreRing({ score, countDelay }: { score?: number; countDelay?: number }) {
  return (
    <span className={styles.ring} aria-hidden="true">
      <svg viewBox="0 0 64 64" className={styles.ringSvg} aria-hidden="true" focusable="false">
        <circle className={styles.track} cx="32" cy="32" r={R} />
        {score !== undefined && (
          <circle
            className={styles.arc}
            cx="32"
            cy="32"
            r={R}
            strokeDasharray={`${(score / 100) * C} ${C}`}
            /* the arc's own length, which the entrance draws it from */
            style={{ "--arc": (score / 100) * C } as CSSProperties}
          />
        )}
      </svg>
      {score !== undefined && (
        <span className={`${styles.score} t-h4`}>
          {countDelay === undefined ? score : <CountUp value={score} delay={countDelay} />}
        </span>
      )}
    </span>
  );
}

function Names({ product }: { product: CatalogProduct }) {
  return (
    <span className={styles.names}>
      <span className={`${styles.name} t-label`}>{product.name}</span>
      <span className={`${styles.brand} t-caption`}>{product.brand}</span>
    </span>
  );
}

function RemoveButton({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      className={styles.remove}
      /* the glyph is the whole control, so the name has to carry both the
         action and which product it acts on */
      aria-label={`Remove ${name} from this analysis`}
      onClick={onRemove}
    >
      <CloseIcon className={styles.removeIcon} />
    </button>
  );
}

/**
 * What a card opens onto: the compatibility bar, the score in words, the
 * ingredients that cost it points, and the recommendation — the body the
 * accordion used to reveal, unchanged in content.
 */
function CompatDetail({ analysis }: { analysis: CheckAnalysis }) {
  const { product, score, band, riskyIngredients, recommendation } = analysis;

  return (
    <div className={styles.detail} data-band={band}>
      {/* the tray names nothing on screen (its title is its accessible name),
          so the detail says which product it is about, ring and all */}
      <div className={styles.detailHead}>
        <ScoreRing score={score} />
        <span className={styles.detailNames}>
          <h2 className={`${styles.detailName} t-h5`}>{product.name}</h2>
          <span className={`${styles.brand} t-caption`}>{product.brand}</span>
        </span>
      </div>

      <div className={styles.bar} role="img" aria-label={`${score}% compatible`}>
        <span className={styles.fill} style={{ width: `${score}%` }} />
      </div>

      <p className={`${styles.summary} t-body3`}>
        {score}% compatible · {BAND_LABEL[band]}
      </p>

      {riskyIngredients.length > 0 && (
        <>
          <p className={`${styles.sectionLabel} t-label`}>Risky ingredients</p>
          <ul className={styles.tags}>
            {riskyIngredients.map((ingredient) => (
              <li key={ingredient} className={`${styles.tag} t-label-sm`}>
                {ingredient}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className={styles.recommendation}>
        <p className={`${styles.recTitle} t-label`}>Recommendation</p>
        <p className={`${styles.recBody} t-body3`}>{recommendation}</p>
      </div>
    </div>
  );
}
