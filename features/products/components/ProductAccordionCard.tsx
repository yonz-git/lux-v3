"use client";

import { useId, useState } from "react";
import styles from "./ProductAccordionCard.module.css";
import { ProductThumb } from "./ProductThumb";
import { Collapse } from "@/components/ui/Collapse";
import { ChevronDownIcon } from "@/components/ui/icons";
import { ProductDetails } from "./ProductDetails";
import { fullName, type CatalogProduct } from "@/features/products/products";

/**
 * One saved product, collapsed or expanded. Figma `product · …` inside
 * `Long-term products list` (581:1593 / 583:1924).
 */
export function ProductAccordionCard({
  product,
  onRemove,
  compact = false,
}: {
  /** `addedOn` when the user owns it — `ProductDetails` shows `Added` then */
  product: CatalogProduct & { addedOn?: string };
  onRemove?: () => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div
      className={`${styles.card}${compact ? ` ${styles.compact}` : ""}`}
      data-open={open}
    >
      <button
        type="button"
        className={styles.header}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <ProductThumb product={product} size={compact && !open ? "sm" : "md"} />
        <span className={styles.copy}>
          <span className={`${styles.name} t-label-h6`}>
            {fullName(product)}
          </span>
        </span>
        <ChevronDownIcon className={styles.chevron} />
      </button>

      <Collapse open={open}>
        <div id={panelId} className={styles.panel}>
          <span className={styles.divider} aria-hidden="true" />

          <ProductDetails product={product} />

          {onRemove && (
            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.remove} t-label tap-target`}
                onClick={onRemove}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </Collapse>
    </div>
  );
}
