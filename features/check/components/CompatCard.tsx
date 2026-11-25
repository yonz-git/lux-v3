"use client";

import { type CSSProperties, useState } from "react";
import styles from "./CompatCard.module.css";
import { Sheet } from "@/components/ui/Sheet";
import { Tag } from "@/components/ui/Tag";
import { CountUp } from "@/components/ui/CountUp";
import { CloseButton } from "@/components/ui/CloseButton";
import { BAND_LABEL, type CheckAnalysis } from "@/features/check/check";
import { type CatalogProduct, fullName } from "@/features/products/products";
import { ProductThumb } from "@/features/products/components/ProductThumb";

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
        <span className={styles.top}>
          <ScoreRing score={score} countDelay={200 + index * 90} />
          <ProductThumb product={product} />
        </span>
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

/** A product added since the check ran — the card's shape with nothing scored. */
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
        <span className={styles.top}>
          <ScoreRing />
          <ProductThumb product={product} />
        </span>
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
        <span className={`${styles.score} t-metric3`}>
          {countDelay === undefined ? score : <CountUp value={score} delay={countDelay} />}
        </span>
      )}
    </span>
  );
}

function Names({ product }: { product: CatalogProduct }) {
  return (
    <span className={styles.names}>
      <span className={`${styles.name} t-h6`}>{product.name}</span>
      <span className={`${styles.brand} t-label-sm`}>{product.brand}</span>
    </span>
  );
}

function RemoveButton({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <CloseButton
      label={`Remove ${name} from this analysis`}
      className={styles.remove}
      onClick={onRemove}
    />
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
          <span className={`${styles.brand} t-label-sm`}>{product.brand}</span>
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
        <p className={`${styles.recBody} t-body2`}>{recommendation}</p>
      </div>
    </div>
  );
}
