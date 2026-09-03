"use client";

import { useId, useState } from "react";
import styles from "./ProductDetails.module.css";
import { ChevronDownIcon } from "./icons";
import { formatAdded, type CatalogProduct } from "@/lib/products";

/**
 * What a product IS: added, brand, size, and its ingredient list behind a
 * disclosure. The block a product card opens onto.
 *
 * ⚠️ IT LIVES HERE BECAUSE TWO SCREENS OPEN IT. It was local to
 * `ProductAccordionCard`, i.e. to the PRODUCTS hub; `/check/new` expands its
 * own products now and the two must not drift — this is a readout of the same
 * five fields, and a screen that ordered them differently or dropped one would
 * make the same product look like two different records depending on which tab
 * you found it in. The CARDS still differ (the hub's carries Edit/Remove, the
 * check's carries the Add control); the record does not.
 *
 * ⚠️ `Added` LEADS, AND IT IS NOT IN FIGMA. 581:1593 orders them Brand, Size,
 * Added. Brand and size are already on the collapsed header of both callers —
 * the hub's title is `fullName`, i.e. brand + name, with the size under it, and
 * the check's meta line is `resultMeta`, brand — size — so the panel opened by
 * restating the row that was just tapped and buried the one fact only it
 * carries. When the product entered the library is also the fact the hub is
 * grouped BY. Brand and Size stay: a detail list naming two of a product's
 * three attributes reads as though the third were missing.
 *
 * ⚠️ `Added` IS THE ONE OPTIONAL ROW. Every product the user OWNS has an
 * `addedOn`; a bare `CatalogProduct` — a live Open Beauty Facts result, a
 * catalogue entry not yet added — does not, and a row reading "Added —" says
 * less than no row at all.
 *
 * ⚠️ INGREDIENTS ARE A NESTED DISCLOSURE, ALSO NOT IN FIGMA. An INCI list is
 * 15–25 comma-separated terms; as a fourth `Detail` it would be a paragraph in
 * the value column of a list whose other values are two words, and it would
 * push every other card in an open group off the screen. Closed by default, so
 * the panel's resting height is unchanged, and outside the `<dl>` because a
 * disclosure button is not a `<dd>`. Its chevron is `icon-xs` against the
 * card's `icon-sm`: that one step is what says this disclosure belongs TO the
 * card rather than being a second card.
 *
 * ⚠️ IT IS NOT DRAWN WHEN THERE IS NOTHING TO LIST. Every catalogue entry
 * carries an INCI list and so does every Open Beauty Facts result, but
 * `ingredients` is optional on `CatalogProduct` and a disclosure that opens
 * onto nothing is worse than an absent one.
 */
export function ProductDetails({
  product,
}: {
  /** `addedOn` when the user owns it — see the note above. */
  product: CatalogProduct & { addedOn?: string };
}) {
  const [inciOpen, setInciOpen] = useState(false);
  const inciId = useId();

  return (
    <div className={styles.details}>
      <dl className={styles.list}>
        {product.addedOn && (
          <Detail label="Added" value={formatAdded(product.addedOn)} />
        )}
        <Detail label="Brand" value={product.brand} />
        <Detail label="Size" value={product.size} />
      </dl>

      {product.ingredients && (
        <div className={styles.inci} data-open={inciOpen}>
          <button
            type="button"
            className={styles.inciToggle}
            aria-expanded={inciOpen}
            aria-controls={inciId}
            onClick={() => setInciOpen((o) => !o)}
          >
            <span className={`${styles.inciLabel} t-label-sm`}>Ingredients</span>
            <ChevronDownIcon className={styles.inciChevron} />
          </button>

          {inciOpen && (
            <p id={inciId} className={`${styles.inciList} t-body3 reveal-quick`}>
              {product.ingredients}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** `detail · …` — label left in Label Small/muted, value right in Body 3. */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detail}>
      <dt className={`${styles.detailLabel} t-label-sm`}>{label}</dt>
      <dd className={`${styles.detailValue} t-body3`}>{value}</dd>
    </div>
  );
}
