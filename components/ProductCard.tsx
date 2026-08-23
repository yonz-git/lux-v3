import styles from "./ProductCard.module.css";
import { Tag } from "./Tag";
import { CameraIcon } from "./icons";
import { fullName, type CatalogProduct } from "@/lib/products";
import { useProductPhoto } from "@/lib/useProductPhoto";

/**
 * The big product card on `04 — Confirm product` (577:1430) and
 * `04 — Product match` (578:1482).
 *
 * One component, because the two are the same card: an image well, the name, the
 * size, and — on Confirm only — a description. Product match adds a "N% match"
 * `Tag` above the image and drops the description.
 *
 * ⚠️ THE IMAGE WELL WAS A PLACEHOLDER. There was no product imagery in the
 * file and no product icon in the design system, so both comps draw a camera
 * glyph on `bg/surface-frost` — still the fallback here when `product` has no
 * `imageUrl`. A product sourced from Open Beauty Facts (a live search result,
 * or a scan match run through `useEnrichedProduct`) carries a real photo,
 * which fills the same OPAQUE well instead. It stays opaque either way — a
 * frosted well would show the canvas gradient through the photo. Same
 * broken/near-blank fallback as ProductThumb, via `useProductPhoto`.
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
  const { showPhoto, onLoad, onError } = useProductPhoto(product.imageUrl);

  return (
    <div className={styles.card}>
      {matchScore != null && (
        <span className={styles.badge}>
          <Tag variant="brand">{matchScore}% match</Tag>
        </span>
      )}

      <div className={styles.image} aria-hidden="true">
        {showPhoto ? (
          <img
            src={product.imageUrl}
            alt=""
            className={styles.photo}
            onLoad={onLoad}
            onError={onError}
          />
        ) : (
          <CameraIcon className={styles.glyph} />
        )}
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
