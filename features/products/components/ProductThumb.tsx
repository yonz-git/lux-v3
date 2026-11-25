import styles from "./ProductThumb.module.css";
import { ProductArt } from "./ProductArt";
import type { CatalogProduct } from "@/features/products/products";

/**
 * The square product thumbnail on every product row — Figma `product-thumb`,
 * 48x48 (`size/control-md`), radius/md, `bg/surface-frost` + 1px `border/subtle`.
 */
export function ProductThumb({
  className,
  product,
  size = "md",
}: {
  className?: string;
  product: CatalogProduct;
  size?: "md" | "sm";
}) {
  return (
    <span
      className={[styles.thumb, size === "sm" && styles.sm, className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <ProductArt product={product} className={styles.art} />
    </span>
  );
}
