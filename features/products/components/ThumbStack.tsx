import styles from "./ThumbStack.module.css";
import { ProductArt } from "./ProductArt";
import type { CatalogProduct } from "@/features/products/products";

const PREVIEW_MAX = 3;

export function ThumbStack({
  products,
  className,
}: {
  products: CatalogProduct[];
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <span
      className={`${styles.stack}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      {products.slice(0, PREVIEW_MAX).map((p) => (
        <span key={p.id} className={styles.thumb}>
          <ProductArt product={p} className={styles.art} />
        </span>
      ))}
    </span>
  );
}
