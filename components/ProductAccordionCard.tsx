"use client";

import { useState } from "react";
import styles from "./ProductAccordionCard.module.css";
import { ProductThumb } from "./ProductThumb";
import { ChevronDownIcon } from "./icons";
import { formatAdded, fullName, type SavedProduct } from "@/lib/products";

/**
 * One saved product, collapsed or expanded. Figma `product · …` inside
 * `Long-term products list` (581:1593 / 583:1924).
 *
 * ⚠️ IT LIVES IN ITS OWN FILE NOW, AND THE SCREEN IT CAME FROM IS GONE. It was
 * local to `BucketProductsList`, the pushed view at `/products/[bucket]`; the
 * PRODUCTS hub expands its groups in place instead, so this card is what a hub
 * group opens onto. See `MyProducts` for the change and why.
 *
 * ⚠️ THE DURATION IS GONE FROM THIS CARD — BOTH PLACES IT APPEARED. It was a
 * `Tag` on the collapsed header and a "Duration" row in the expanded details.
 * Neither could ever say anything the screen had not already said: `bucket` is
 * derived from `duration` by `bucketFor` and by nothing else, a strict 1:1, so
 * EVERY product under one group header carries the identical value — the one
 * that header is naming. A "4+ weeks" badge repeated down a list headed
 * "Long-term products" is noise that reads like data.
 *
 * `Your products` already worked this way and stated the rule: it shows the
 * per-row duration Tag ONLY in its flat, single-group state, "carrying the
 * period information a header would otherwise repeat", and drops it the moment
 * group headers appear. This card is only ever rendered under a group header —
 * the hub row that opened it — so the same rule applies.
 *
 * The window that DEFINES the group shows on that hub row. See `MyProducts`.
 *
 * ⚠️ NOT IN FIGMA: 581:1593 draws the badge. The chevron is unchanged — the same
 * glyph in both states, rotated; `chevron-up` in Figma is literally a
 * `chevron-down` instance at 180°.
 *
 * ⚠️ "Edit" HAS NO DESTINATION. The design defines no edit screen — not in the
 * comps and not in the wireframes — so it is inert here, deliberately, rather
 * than being wired to an invented flow. "Remove" is real: it is the one card
 * action the store can actually perform. This is on the open-questions list.
 *
 * ⚠️ `Added` LEADS THE DETAILS — NOT IN FIGMA. 581:1593 orders them Brand,
 * Size, Added. Brand and size are already ON the collapsed header — the name
 * this card writes is `fullName`, i.e. brand + name, and the size is the line
 * directly under it — so the first two rows of the opened panel restated what
 * the row the user just tapped was already showing, and the one fact the panel
 * alone carries sat third. When the product entered the library is also the
 * fact this screen exists to organise: the whole hub is grouped by how long you
 * have used something. Brand and Size stay, because a detail list that names
 * two of a product's three attributes reads as though the third were missing.
 *
 * ⚠️ INGREDIENTS ARE A NESTED DISCLOSURE, AND ALSO NOT IN FIGMA. An INCI list
 * is 15–25 comma-separated terms; as a fourth `Detail` row it would be a
 * paragraph in the value column of a list whose other three values are two
 * words, and it would push every card in an opened group off the screen. So it
 * is the one detail that opens on its own — closed by default, so the panel's
 * resting height is unchanged.
 *
 * It sits AFTER Size and outside the `<dl>`: a disclosure button is not a
 * `<dd>`, and the definition list stays three clean label/value pairs. Its
 * chevron is `icon-xs` against the header's `icon-sm`, which is what says this
 * one is subordinate to the card rather than a second card.
 *
 * ⚠️ IT IS NOT DRAWN WHEN THERE IS NOTHING TO LIST. Every catalogue product
 * carries an INCI list and so does every Open Beauty Facts result, but
 * `ingredients` is optional on `CatalogProduct` and a disclosure that opens
 * onto nothing is worse than an absent one. Same rule `CheckInDetail` follows.
 *
 * The design system has no accordion component; this is composed from the
 * frosted card recipe. It is on the missing-from-the-DS list.
 */
export function ProductAccordionCard({
  product,
  onRemove,
}: {
  product: SavedProduct;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [inciOpen, setInciOpen] = useState(false);
  const panelId = `product-${product.id}`;
  const inciId = `product-${product.id}-ingredients`;

  return (
    <div className={styles.card} data-open={open}>
      <button
        type="button"
        className={styles.header}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <ProductThumb product={product} />
        <span className={styles.copy}>
          <span className={`${styles.name} t-h6`}>{fullName(product)}</span>
          <span className={`${styles.size} t-label-sm`}>{product.size}</span>
        </span>
        <ChevronDownIcon className={styles.chevron} />
      </button>

      {open && (
        <div id={panelId} className={`${styles.panel} reveal-quick`}>
          <span className={styles.divider} aria-hidden="true" />

          <dl className={styles.details}>
            <Detail label="Added" value={formatAdded(product.addedOn)} />
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

          <div className={styles.actions}>
            <button type="button" className={`${styles.edit} t-label tap-target`}>
              Edit
            </button>
            <button
              type="button"
              className={`${styles.remove} t-label tap-target`}
              onClick={onRemove}
            >
              Remove
            </button>
          </div>
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
