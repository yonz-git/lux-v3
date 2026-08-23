"use client";

import type { ReactNode } from "react";
import styles from "./ProductList.module.css";
import { ProductThumb } from "./ProductThumb";
import { PlusIcon } from "./icons";

/**
 * The three pieces every PRODUCTS list screen is built from. They are kept
 * together because they share one recipe — the frosted row — and because
 * splitting three ten-line primitives across three files hides how consistent
 * they are meant to be.
 *
 * Figma: `result · …` (576:1428), `product · …` (578:1557), `add-product`
 * (574:1391), `add-more` (581:1593), `empty-state` (574:1391).
 */

/**
 * A product row: 48px thumb, a two-line copy block, and a trailing slot for
 * whatever that screen puts on the right — a chevron on a search result, a
 * duration `Tag` on a saved product.
 *
 * `onClick` turns the whole row into a button. A row with no `onClick` renders
 * as a plain div: the added-products list is a readout, not a picker.
 */
export function ProductRow({
  name,
  meta,
  trailing,
  onClick,
  imageUrl,
}: {
  name: string;
  meta: string;
  trailing?: ReactNode;
  onClick?: () => void;
  /** a real product photo, when the row's product came from Open Beauty
   *  Facts — see ProductThumb */
  imageUrl?: string;
}) {
  const inner = (
    <>
      <ProductThumb imageUrl={imageUrl} />
      <span className={styles.copy}>
        <span className={`${styles.name} t-h6`}>{name}</span>
        <span className={`${styles.meta} t-label-sm`}>{meta}</span>
      </span>
      {trailing}
    </>
  );

  if (!onClick) {
    return <div className={styles.row}>{inner}</div>;
  }
  return (
    <button type="button" className={styles.row} data-interactive onClick={onClick}>
      {inner}
    </button>
  );
}

/**
 * The "＋ Add product" row — the same frosted surface as a product row, but
 * centred and label-only. `Button` would be wrong here: this is a list
 * affordance sitting among rows, not the screen's primary action, and Figma
 * builds it as a row rather than instancing the Button component.
 *
 * The label carries the `Button` text style (Regular 15) even so, which is what
 * the comp does.
 */
export function AddProductRow({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={styles.add} onClick={onClick}>
      <PlusIcon className={styles.plus} />
      <span className="t-button">{label}</span>
    </button>
  );
}

/**
 * The "nothing here yet" box — a frosted panel with a single muted line.
 * radius/2xl rather than radius/lg, which is what `empty-state` (574:1391)
 * draws.
 */
export function EmptyBox({ children }: { children: ReactNode }) {
  return (
    <div className={styles.empty}>
      <p className={`${styles.emptyLabel} t-body3`}>{children}</p>
    </div>
  );
}
