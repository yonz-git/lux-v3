import styles from "./ProductCard.module.css";
import { Tag } from "./Tag";
import { CameraIcon } from "./icons";
import { fullName, type CatalogProduct } from "@/lib/products";

/**
 * The big product card on `04 — Confirm product` (577:1430) and
 * `04 — Product match` (578:1482).
 *
 * One component, because the two are the same card: an image well, the name, the
 * size, and — on Confirm only — a description. Product match adds a "N% match"
 * `Tag` above the image and drops the description.
 *
 * ⚠️ THE IMAGE WELL IS A PLACEHOLDER. There is no product imagery in the file
 * and no product icon in the design system, so both comps draw a camera glyph on
 * `bg/surface-frost`. The well is OPAQUE — it stands in for a photograph, and a
 * frosted one would show the canvas gradient through the "image".
 */
export function ProductCard({
  product,
  matchScore,
  showDescription,
}: {
  product: CatalogProduct;
  /** renders the "92% match" brand Tag above the image */
  matchScore?: number;
  showDescription?: boolean;
}) {
  return (
    <div className={styles.card}>
      {matchScore != null && (
        <span className={styles.badge}>
          <Tag variant="brand">{matchScore}% match</Tag>
        </span>
      )}

      <div className={styles.image} aria-hidden="true">
        <CameraIcon className={styles.glyph} />
      </div>

      <p className={`${styles.name} t-h5`}>{fullName(product)}</p>
      <p className={`${styles.size} t-label-sm`}>{product.size}</p>
      {showDescription && product.description && (
        <p className={`${styles.description} t-body3`}>{product.description}</p>
      )}
    </div>
  );
}
