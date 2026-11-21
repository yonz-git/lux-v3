import styles from "./ProductCard.module.css";
import { Tag } from "@/components/ui/Tag";
import { ProductArt } from "./ProductArt";
import { ProductDetails } from "./ProductDetails";
import { fullName, type CatalogProduct } from "@/features/products/products";

/**
 * The big product card on `04 — Confirm product` (577:1430) and
 * `04 — Product match` (578:1482).
 *
 * One component, because the two are the same card: an image well, the name
 * and the product's details (Brand, Size, the ingredients dropdown). Product
 * match adds a "N% match" `Tag` above the image.
 */
export function ProductCard({
  product,
  matchScore,
}: {
  product: CatalogProduct;
  /** renders the "92% match" brand Tag above the image */
  matchScore?: number;
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
      <ProductDetails product={product} />
    </div>
  );
}
