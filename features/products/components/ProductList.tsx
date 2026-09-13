"use client";

import { useId, useState, type ReactNode } from "react";
import styles from "./ProductList.module.css";
import { ProductThumb } from "./ProductThumb";
import { Collapse } from "@/components/ui/Collapse";
import { ChevronDownIcon, PlusIcon } from "@/components/ui/icons";
import type { CatalogProduct } from "@/features/products/products";

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
 *
 * ⚠️ `details` OPENS THE ROW IN PLACE, AND IS NOT IN FIGMA. `/check/new` shows
 * the products you own beside an `Add` control, and until now that was every
 * word it would ever tell you about them — you could add a product to a
 * COMPATIBILITY check without being able to see what was in it. The PRODUCTS
 * hub answers exactly that question by expanding its cards, so the row learned
 * the same move rather than the check growing a second way to look a product
 * up. See `ProductDetails`, which is what both screens open onto.
 *
 * The disclosure is the thumb + copy + chevron, NOT the whole row: the
 * trailing slot on that screen holds the `Add` button, and one tap target that
 * both expands the row and adds the product would be two actions on one
 * control. `onClick` and `details` are therefore mutually exclusive in
 * practice — a row that is itself a button has no room for a second one.
 *
 * ⚠️ THE CHEVRON IS `icon-sm`, THE CARD-LEVEL SIZE. `ProductDetails` puts an
 * `icon-xs` one on its ingredients toggle, and that step down is what says the
 * inner disclosure is subordinate to this one.
 */
export function ProductRow({
  name,
  meta,
  trailing,
  onClick,
  product,
  details,
}: {
  name: string;
  meta: string;
  trailing?: ReactNode;
  onClick?: () => void;
  /** ⚠️ THE PRODUCT, NOT A URL. The thumb draws the product when there is no
   *  photograph to show, so it needs to know which product it is — see
   *  ProductThumb. `name` and `meta` stay separate props because a row does
   *  not always title itself the way `fullName` would: the check list shows
   *  the product name with the brand moved down into the meta line. */
  product: CatalogProduct;
  /** what the row opens onto. Absent = the row does not open. */
  details?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const inner = (
    <>
      <ProductThumb product={product} />
      <span className={styles.copy}>
        <span className={`${styles.name} t-h6`}>{name}</span>
        <span className={`${styles.meta} t-label-sm`}>{meta}</span>
      </span>
      {trailing}
    </>
  );

  if (details) {
    return (
      <div className={styles.row} data-expandable data-open={open}>
        <div className={styles.head}>
          <button
            type="button"
            className={styles.disclosure}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((o) => !o)}
          >
            <ProductThumb product={product} />
            <span className={styles.copy}>
              <span className={`${styles.name} t-h6`}>{name}</span>
              <span className={`${styles.meta} t-label-sm`}>{meta}</span>
            </span>
            <ChevronDownIcon className={styles.chevron} />
          </button>
          {trailing}
        </div>

        <Collapse open={open}>
          <div id={panelId} className={styles.panel}>
            <span className={styles.divider} aria-hidden="true" />
            {details}
          </div>
        </Collapse>
      </div>
    );
  }

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
 *
 * ⚠️ `compact` IS THE SAME BOX INSIDE ANOTHER ONE, and it exists for exactly
 * one caller: an empty category group on the PRODUCTS hub, which opens onto
 * this box INSIDE the row's own surface. It matches what the product cards do
 * there — 12 radius, opaque fill, less air — because an empty group and a full
 * one have to open onto the same shape or the box looks like a different kind
 * of thing. See `.compact` in ProductAccordionCard.module.css for the
 * reasoning; this is that recipe, not a second one.
 */
export function EmptyBox({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`${styles.empty}${compact ? ` ${styles.emptyCompact}` : ""}`}>
      <p className={`${styles.emptyLabel} t-body3`}>{children}</p>
    </div>
  );
}
