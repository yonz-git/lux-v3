"use client";

import styles from "./ProductDetails.module.css";
import { IngredientsDisclosure } from "./IngredientsDisclosure";
import { formatAdded, sizeInMl, type CatalogProduct } from "@/features/products/products";

/**
 * What a product IS: added, brand, size, and its ingredient list behind a
 * disclosure. The block a product card opens onto.
 */
export function ProductDetails({
  product,
}: {
  product: CatalogProduct & { addedOn?: string };
}) {
  return (
    <div className={styles.details}>
      <dl className={styles.list}>
        {product.addedOn && (
          <Detail label="Added" value={formatAdded(product.addedOn)} />
        )}
        <Detail label="Brand" value={product.brand} />
        {/* in ml — see `sizeInMl`. */}
        <Detail label="Size" value={sizeInMl(product.size) ?? "Not set"} />
        {/* no list to disclose — the row still says so, as `Size` does */}
        {!product.ingredients && <Detail label="Ingredients" value="Not set" />}
      </dl>

      {/* the shared dropdown — `ProductCard` draws the same one */}
      {product.ingredients && (
        <IngredientsDisclosure ingredients={product.ingredients} />
      )}
    </div>
  );
}

/** `detail · …` — label left in Label Small/muted, value right in Body 3. */
function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className={styles.detail}>
      <dt className={`${styles.detailLabel} t-label-sm`}>{label}</dt>
      <dd className={`${styles.detailValue} t-body3`}>{value}</dd>
    </div>
  );
}
