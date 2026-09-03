import styles from "./ProductCard.module.css";
import { Tag } from "@/components/ui/Tag";
import { ProductArt } from "./ProductArt";
import { fullName, type CatalogProduct } from "@/features/products/products";

/**
 * The big product card on `04 — Confirm product` (577:1430) and
 * `04 — Product match` (578:1482).
 *
 * One component, because the two are the same card: an image well, the name, the
 * size, and — on Confirm only — a description. Product match adds a "N% match"
 * `Tag` above the image and drops the description.
 *
 * ⚠️ THE IMAGE WELL WAS A CAMERA GLYPH, AND IS NOW A DRAWN VESSEL. There was
 * no product imagery in the file and no product icon in the design system, so
 * both comps draw a camera on `bg/surface-frost`. This is the screen that asks
 * "is this it?" — a camera is the one picture that cannot answer that question,
 * because it is the same picture for every product. A product sourced from Open
 * Beauty Facts used to bring a real photo here and that photo used to win.
 * It no longer does: OBF's images are crowdsourced with no quality gate, so
 * "is this it?" was being answered by a stub or an angled box about as often
 * as by a usable front-of-package shot. A drawing that is always the right
 * vessel in the right brand tint answers it more reliably than a photo that is
 * sometimes right. See `ProductArt` and lib/openBeautyFacts.ts.
 *
 * The well stays OPAQUE — a frosted well would show the canvas gradient
 * through the artwork.
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
        <ProductArt product={product} className={styles.art} />
      </div>

      <p className={`${styles.name} t-h5`}>{fullName(product)}</p>
      <p className={`${styles.size} t-label-sm`}>{product.size}</p>
      {showDescription && product.description && (
        <div className={styles.ingredients}>
          <p className={`${styles.ingredientsLabel} t-label-sm`}>Ingredients</p>
          <p className={`${styles.description} t-body3`}>{product.description}</p>
        </div>
      )}
    </div>
  );
}
